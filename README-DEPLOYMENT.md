# Guía de Despliegue - Premiarte Astro

## Configuración con SQLite

Tu proyecto usa SQLite tanto en desarrollo como en producción, lo que simplifica mucho el despliegue.

### 1. Configuración de la base de datos

La base de datos SQLite se almacena en un volumen persistente de Docker:

- **Ruta en el contenedor**: `/app/data/production.db`
- **Variable de entorno**: `DATABASE_URL=file:./data/production.db`
- **Volumen**: `sqlite_data` (persistente entre reinicios)

### 2. Configurar variables de entorno en Coolify

Basándote en `env.example`, configura solo estas variables:

```bash
# Clerk Authentication (OBLIGATORIAS)
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_tu_clave_aqui
CLERK_SECRET_KEY=sk_live_tu_clave_aqui

# Cloudinary (OPCIONALES)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

**No necesitas configurar DATABASE_URL** - se define automáticamente en el docker-compose.

### 3. Comandos útiles después del despliegue

```bash
# Ejecutar migraciones en el contenedor
docker-compose exec app npx prisma migrate deploy

# Generar el cliente de Prisma
docker-compose exec app npx prisma generate

# Ver logs de la aplicación
docker-compose logs -f app

# Acceder al contenedor para debug
docker-compose exec app sh

# Ver el contenido de la base de datos
docker-compose exec app npx prisma studio
```

### 4. Estructura del proyecto para Coolify

Tu repositorio debe incluir:

- `Dockerfile`
- `docker-compose.yml`
- `prisma/schema.prisma` (con SQLite)
- Variables de entorno configuradas en Coolify

### 5. Ventajas de usar SQLite en producción

- ✅ **Simplicidad**: No necesitas configurar servidor de BD separado
- ✅ **Rendimiento**: Excelente para aplicaciones pequeñas/medianas
- ✅ **Persistencia**: Los datos se guardan en volumen Docker
- ✅ **Backups**: Fácil de respaldar (un solo archivo)
- ✅ **Cero configuración**: Funciona inmediatamente

### 6. Consideraciones importantes

- La base de datos se crea automáticamente al primer arranque
- Los datos persisten entre reinicios del contenedor
- El volumen `sqlite_data` contiene tu base de datos
- Prisma maneja automáticamente las migraciones

### 7. Verificación del despliegue

1. Comprueba que la aplicación responda en tu dominio
2. Verifica que Clerk funciona correctamente
3. Prueba las funcionalidades que usan la base de datos
4. Revisa los logs para errores

### 8. Backup de la base de datos

Para hacer backup de tu base de datos SQLite:

```bash
# Copiar la base de datos desde el volumen
docker cp $(docker-compose ps -q app):/app/data/production.db ./backup-$(date +%Y%m%d).db
```

## Resumen

- **Solo necesitas configurar las variables de Clerk** en Coolify
- **SQLite se configura automáticamente** con volumen persistente
- **Un solo contenedor** - sin complejidad de múltiples servicios
- **Despliegue simple** y directo
