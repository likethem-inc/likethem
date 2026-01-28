# ✅ Checklist de Implementación: Supabase Storage

Use este checklist para verificar que la integración de Supabase Storage esté completamente configurada.

## 🎯 Pre-requisitos

- [ ] Tienes acceso al Dashboard de Supabase
- [ ] Tienes acceso a las variables de entorno del proyecto
- [ ] Puedes iniciar sesión en la aplicación likethem como usuario autenticado

## 📦 1. Configuración de Supabase

### Crear Bucket
- [ ] Acceder al Dashboard de Supabase → Storage
- [ ] Crear bucket con nombre exacto: `products`
- [ ] Marcar como "Public bucket" (casilla activada)
- [ ] Bucket creado exitosamente

### Configurar RLS Policies
Ejecutar estos 3 SQL queries en el SQL Editor de Supabase:

```sql
-- 1. Política de lectura pública
CREATE POLICY "Allow public read access to product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');

-- 2. Política de escritura para usuarios autenticados
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- 3. Política de eliminación para usuarios autenticados
CREATE POLICY "Allow authenticated users to delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'products');
```

- [ ] Política de SELECT creada
- [ ] Política de INSERT creada
- [ ] Política de DELETE creada

## ⚙️ 2. Variables de Entorno

### Obtener Credenciales
En Supabase Dashboard → Settings → API:

- [ ] Copiar "Project URL" (NEXT_PUBLIC_SUPABASE_URL)
- [ ] Copiar "anon public" key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Copiar "service_role" key (SUPABASE_SERVICE_ROLE_KEY) ⚠️ **Mantener secreta**

### Configurar .env
Agregar o actualizar en tu archivo `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-aquí"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aquí"
```

- [ ] Variables agregadas al archivo `.env`
- [ ] Variables **NO** están commiteadas en git
- [ ] `.env` está en `.gitignore`

### Configurar en Producción
Si usas Vercel, Netlify, o similar:

- [ ] Variables agregadas en el panel de configuración
- [ ] Variables marcadas como "secret" o "encrypted"
- [ ] Redeploy activado si es necesario

## 🧪 3. Verificación

### Ejecutar Script de Verificación
```bash
npm run verify:storage
```

- [ ] Script ejecuta sin errores
- [ ] Muestra: "✅ El bucket 'products' existe y está accesible"
- [ ] Muestra: "🎉 ¡Configuración correcta!"

### Verificación Manual en Dashboard
- [ ] En Supabase → Storage → products, el bucket aparece
- [ ] El bucket muestra como "Public"
- [ ] Las políticas aparecen en la pestaña "Policies"

## 🎨 4. Prueba de Upload

### Prueba Funcional
- [ ] Iniciar aplicación: `npm run dev`
- [ ] Iniciar sesión como curador o administrador
- [ ] Navegar a página de creación de producto
- [ ] Seleccionar una imagen (jpg/png, <5MB)
- [ ] Hacer clic en "Upload" o "Subir"
- [ ] Esperar confirmación de subida exitosa

### Verificar Resultado
- [ ] La imagen aparece en preview del producto
- [ ] En Supabase Dashboard → Storage → products, la imagen aparece
- [ ] La ruta es: `products/likethem/products/[timestamp]-[random].[ext]`
- [ ] Al hacer clic en la imagen, se puede ver en el navegador
- [ ] La URL es del formato: `https://[proyecto].supabase.co/storage/v1/object/public/products/...`

### Prueba de Límites
- [ ] Subir imagen >5MB: debe rechazar con error claro
- [ ] Subir archivo no-imagen (pdf, txt): debe rechazar
- [ ] Subir 6 imágenes a la vez: debe rechazar (máx 5)
- [ ] Subir sin autenticación: debe rechazar con 401

## 🌐 5. Configuración de Next.js

### Verificar next.config.js
- [ ] Archivo `next.config.js` contiene: `{ protocol: 'https', hostname: '*.supabase.co' }`
- [ ] No hay errores de sintaxis
- [ ] Reiniciar dev server después de cambios

### Prueba de Visualización
- [ ] Crear producto con imagen subida
- [ ] Ver producto en frontend
- [ ] Imagen se carga correctamente
- [ ] No hay errores de CORS en consola del navegador
- [ ] No hay advertencias de "unoptimized image"

## 📚 6. Documentación

- [ ] Leer `docs/SUPABASE_STORAGE_SETUP.md`
- [ ] Leer `docs/MIGRATION_CLOUDINARY_TO_SUPABASE.md`
- [ ] Equipo informado sobre el cambio
- [ ] Documentación interna actualizada

## 🗑️ 7. Limpieza (Opcional)

### Si ya NO usas Cloudinary:
- [ ] Eliminar variables de entorno de Cloudinary:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`
  - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
  - `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- [ ] ⚠️ **NO** eliminar el paquete `cloudinary` aún (usado para imágenes legacy)
- [ ] ⚠️ **NO** eliminar `lib/cloudinary.ts` (usado para optimización de URLs)

### Backups
- [ ] Hacer backup de imágenes actuales en Cloudinary (si aplica)
- [ ] Documentar URLs de imágenes existentes en producción

## 🚨 8. Solución de Problemas

Si algo falla, revisar:

- [ ] Console logs en el navegador (F12 → Console)
- [ ] Network tab (F12 → Network) para ver request/response de `/api/upload`
- [ ] Logs del servidor Next.js (`npm run dev` output)
- [ ] Logs en Supabase Dashboard → Logs → Storage

### Errores Comunes

**"SUPABASE_SERVICE_ROLE_KEY is missing"**
- [ ] Variable está en `.env`
- [ ] Archivo `.env` está en la raíz del proyecto
- [ ] Reiniciar servidor de desarrollo

**"new row violates row-level security policy"**
- [ ] Verificar que las 3 políticas RLS están creadas
- [ ] Verificar que estás autenticado
- [ ] Verificar que el bucket se llama exactamente `products`

**"The resource already exists"**
- [ ] El bucket ya existe, no necesitas crearlo de nuevo
- [ ] Verificar que sea público y tenga las políticas correctas

**Las imágenes no se cargan en el frontend**
- [ ] Verificar `next.config.js` tiene el dominio de Supabase
- [ ] Reiniciar servidor de desarrollo después de cambiar config
- [ ] Verificar la URL de la imagen es accesible en el navegador

## ✨ Criterios de Éxito

Todos los siguientes deben ser verdaderos:

- ✅ Bucket `products` existe y es público en Supabase
- ✅ Políticas RLS configuradas (INSERT, DELETE, SELECT)
- ✅ Variables de entorno configuradas correctamente
- ✅ Script `npm run verify:storage` pasa sin errores
- ✅ Puedes subir imágenes desde la UI
- ✅ Las imágenes subidas son visibles en el frontend
- ✅ Las URLs de Supabase funcionan en el navegador
- ✅ El dominio `*.supabase.co` está en `next.config.js`
- ✅ No hay errores en la consola del navegador
- ✅ No hay errores en los logs del servidor

## 📞 Soporte

Si después de seguir todos estos pasos aún tienes problemas:

1. Revisar `docs/SUPABASE_STORAGE_SETUP.md` sección "Solución de Problemas"
2. Verificar logs detallados en Supabase Dashboard
3. Abrir issue en GitHub con:
   - Descripción del problema
   - Mensaje de error completo
   - Pasos ya realizados de este checklist
   - Screenshots si aplica

---

**Fecha de esta guía**: Enero 28, 2026
**Versión**: 1.0
