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

## Resumen

- **Solo configura variables de Turso y Clerk** en Coolify
- **Sin volúmenes Docker** - todo en la nube
- **Sin migraciones complejas** - SQL directo
- **Rendimiento superior** para aplicaciones Astro
