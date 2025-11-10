# Guía de Despliegue - Premiarte Astro con Turso

## Configuración con Turso

Tu proyecto ahora usa Turso, una base de datos SQLite distribuida en la nube, siguiendo las [recomendaciones oficiales de Astro](https://docs.astro.build/es/guides/backend/turso/).

### 1. Configurar base de datos Turso

#### Instalar Turso CLI

```bash
curl -sSfL https://get.tur.so/install.sh | bash
# O con npm
npm install -g @turso/cli
```

#### Crear base de datos

```bash
# Iniciar sesión
turso auth login

# Crear base de datos
turso db create premiarte-db

# Obtener URL de conexión
turso db show premiarte-db --url

# Crear token de autenticación
turso db tokens create premiarte-db
```

#### Crear el esquema

```bash
# Ejecutar el esquema en tu base de datos
turso db shell premiarte-db < schema.sql
```

### 2. Configurar variables de entorno en Coolify

Solo necesitas configurar estas variables:

```bash
# ORIGEN del sitio (OBLIGATORIA para producción)
# ⚠️ MUY IMPORTANTE: Necesaria para protección CSRF de Astro Actions
# Debe ser la URL completa de tu sitio en producción
ORIGIN=https://tudominio.com

# Clerk Authentication (OBLIGATORIAS)
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_tu_clave_aqui
CLERK_SECRET_KEY=sk_live_tu_clave_aqui

# Turso Database (OBLIGATORIAS)
TURSO_DATABASE_URL=libsql://premiarte-db-tu-usuario.turso.io
TURSO_AUTH_TOKEN=tu_token_de_turso

# Cloudinary (OPCIONALES)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**⚠️ IMPORTANTE**: La variable `ORIGIN` es OBLIGATORIA en producción. Sin ella, obtendrás el error:

```
403 - Cross-site POST form submissions are forbidden
```

Esta variable permite que Astro valide correctamente las peticiones POST de los formularios y Astro Actions.

### 3. Ventajas de usar Turso

- ✅ **Distribuido globalmente**: Baja latencia en cualquier región
- ✅ **SQLite compatible**: Mismo SQL que conoces
- ✅ **Sin gestión de servidores**: Completamente managed
- ✅ **Escalado automático**: De 0 a millones de consultas
- ✅ **Réplicas embebidas**: Ultra rápido para lectura
- ✅ **Branching**: Crea ramas de base de datos como Git

### 4. Comandos útiles de Turso

```bash
# Ver bases de datos
turso db list

# Conectar a shell SQL
turso db shell premiarte-db

# Ver estadísticas
turso db show premiarte-db

# Crear token (si necesitas regenerar)
turso db tokens create premiarte-db

# Hacer backup
turso db dump premiarte-db > backup.sql
```

### 5. Estructura del proyecto para Coolify

Tu repositorio incluye:

- `Dockerfile` - Configurado para Turso
- `docker-compose.yml` - Sin volúmenes SQLite
- `schema.sql` - Esquema de base de datos
- `src/lib/turso.ts` - Cliente de Turso
- `src/lib/db.ts` - Utilidades de base de datos

### 6. Desarrollo local vs Producción

**Desarrollo**: Usa la misma base de datos Turso (recomendado)
**Producción**: Usa la misma configuración, solo cambian las URLs

### 7. Migración de datos (si necesario)

Si tienes datos en SQLite local que necesitas migrar:

```bash
# Exportar datos desde SQLite
sqlite3 dev.db .dump > data.sql

# Importar a Turso
turso db shell premiarte-db < data.sql
```

### 8. Verificación del despliegue

1. Comprueba que la aplicación responda en tu dominio
2. Verifica que Clerk funciona correctamente
3. Prueba las operaciones de base de datos
4. Revisa los logs para errores

## Diferencias principales con Prisma

- ✅ **Más simple**: SQL directo en lugar de ORM
- ✅ **Mejor rendimiento**: Menos abstracciones
- ✅ **Astro-native**: Recomendado oficialmente
- ✅ **Edge-ready**: Funciona en edge runtime

## Sistema de Regeneración Automática

### Flujo de regeneración del sitio

El dashboard incluye un sistema automático para regenerar el sitio cuando se modifican datos:

#### 1. **Modificaciones del usuario**

- El admin modifica productos, categorías, imágenes o configuraciones
- Los cambios se guardan en la base de datos Turso
- El usuario puede hacer múltiples modificaciones sin prisa

#### 2. **Regeneración bajo demanda**

- En el dashboard hay un botón **"Regenerar Sitio"**
- Al presionarlo, se confirma la acción
- El sistema inicia la regeneración automática

#### 3. **Flujo técnico**

```
Usuario presiona botón → Dashboard → API /regenerate → Coolify → Deploy automático
```

**Detalle del flujo:**

1. **Frontend**: Llama a `POST /api/regenerate`
2. **Backend**: Llama a la API de Coolify `POST /api/v1/applications/{ID}/deploy`
3. **Coolify**: Ejecuta el deploy completo:
   - Pull del código desde GitHub
   - Build del proyecto Astro
   - Deploy de la nueva versión
   - Actualización automática del sitio

#### 4. **Variables necesarias en Coolify**

Además de las variables de Turso, Clerk y ORIGIN, agregar:

```bash
# Regeneración automática
COOLIFY_API_URL=http://localhost:8000
COOLIFY_API_TOKEN=tu_coolify_api_token
COOLIFY_APPLICATION_ID=tu_application_id
```

#### 5. **Configuración en Coolify**

1. **Generar API Token**: Settings → API Tokens → Crear nuevo token
2. **Obtener Application ID**: De la URL del proyecto en Coolify
3. **Configurar Auto Deploy**: Para que Coolify responda a los comandos de deploy

#### 6. **Ventajas del sistema**

- ✅ **Control total**: El usuario decide cuándo regenerar
- ✅ **Múltiples cambios**: Puede modificar varios elementos antes de deployar
- ✅ **Automático**: Una vez confirmado, todo es automático
- ✅ **Seguro**: Solo usuarios admin pueden triggear deployos
- ✅ **Sin GitHub intermedio**: Coolify maneja directamente el repositorio

## Troubleshooting

### Error: 403 - Cross-site POST form submissions are forbidden

**Síntoma**: Los formularios funcionan en desarrollo pero fallan en producción con error 403.

**Causa**: Problema con protección CSRF de Astro, usualmente por falta de la variable `ORIGIN` o por configuración de proxy (Cloudflare).

**Soluciones**:

#### Solución 1: Configurar variable ORIGIN

1. En Coolify, ve a tu aplicación → Environment Variables
2. Agrega la variable:
   ```
   ORIGIN=https://tudominio.com
   ```
   (Reemplaza con la URL real de tu sitio en producción)
3. Redeploy la aplicación
4. Verifica que el dominio coincida exactamente (incluye `https://` y no agregues `/` al final)

#### Solución 2: Cloudflare con SSL Flexible

Si usas Cloudflare con SSL Flexible (conexión HTTPS al navegador, HTTP al servidor):

**El problema**: Cloudflare reenvía las peticiones como HTTP, pero Astro espera HTTPS.

**La solución**: El proyecto ya incluye un middleware (`src/middleware.ts`) que maneja automáticamente los headers de Cloudflare (`X-Forwarded-Proto` y `X-Forwarded-Host`) para que Astro reconozca correctamente el protocolo original.

**Recomendación**: Si tu servidor soporta SSL, cambia Cloudflare a modo **"Full"** o **"Full (strict)"** en SSL/TLS → Overview para mayor seguridad.

**Nota**: La variable `ORIGIN` sigue siendo necesaria con ambas soluciones.

### Error de conexión a base de datos

**Síntoma**: La aplicación no puede conectarse a Turso.

**Solución**:

1. Verifica que `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` estén correctamente configurados
2. Comprueba que el token no haya expirado: `turso db tokens create premiarte-db`
3. Verifica la conectividad desde tu servidor

### Clerk no funciona en producción

**Síntoma**: La autenticación falla o redirige incorrectamente.

**Solución**:

1. Asegúrate de usar las claves de **producción** (`pk_live_...` y `sk_live_...`)
2. En el dashboard de Clerk, configura el dominio de producción en "Allowed Origins"
3. Verifica que `PUBLIC_CLERK_PUBLISHABLE_KEY` esté correcta

## Resumen

- **Configura ORIGIN, Turso, Clerk y Coolify** en el panel
- **Sin volúmenes Docker** - todo en la nube
- **Sin migraciones complejas** - SQL directo
- **Regeneración automática** desde el dashboard admin
- **Rendimiento superior** para aplicaciones Astro
