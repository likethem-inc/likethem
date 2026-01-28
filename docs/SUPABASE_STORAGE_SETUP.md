# Guía de Configuración: Supabase Storage para Imágenes de Productos

Esta guía te ayudará a configurar Supabase Storage para el almacenamiento de imágenes de productos en **likethem**.

## 📋 Requisitos Previos

- Cuenta de Supabase con un proyecto creado
- Variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` configuradas

## 🪣 Paso 1: Crear el Bucket `products`

1. **Accede al Dashboard de Supabase**
   - Ve a [https://app.supabase.com](https://app.supabase.com)
   - Selecciona tu proyecto

2. **Navega a Storage**
   - En el menú lateral, haz clic en **Storage**
   - Haz clic en el botón **New bucket**

3. **Configura el Bucket**
   - **Name**: `products`
   - **Public bucket**: ✅ **Activado** (marca esta casilla)
   - Haz clic en **Create bucket**

## 🔐 Paso 2: Configurar Políticas RLS (Row Level Security)

Por defecto, un bucket público permite la lectura de archivos, pero necesitamos configurar políticas para las operaciones de subida y eliminación.

### Permitir Subida de Archivos (Upload)

1. En el bucket `products`, haz clic en **Policies**
2. Haz clic en **New Policy**
3. Selecciona **For full customization** o crea desde plantilla
4. Configura la política:

```sql
-- Política: Permitir subida de imágenes de productos a usuarios autenticados
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');
```

### Permitir Eliminación de Archivos (Delete)

```sql
-- Política: Permitir eliminación de imágenes de productos a usuarios autenticados
CREATE POLICY "Allow authenticated users to delete product images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'products');
```

### Permitir Lectura Pública (Public Read)

```sql
-- Política: Permitir lectura pública de imágenes de productos
CREATE POLICY "Allow public read access to product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');
```

## ⚙️ Paso 3: Configurar Variables de Entorno

Asegúrate de tener las siguientes variables de entorno configuradas en tu archivo `.env`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
```

### ¿Dónde obtener estas claves?

1. **NEXT_PUBLIC_SUPABASE_URL**: En el Dashboard de Supabase → Settings → API → Project URL
2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**: En el Dashboard de Supabase → Settings → API → Project API keys → anon public
3. **SUPABASE_SERVICE_ROLE_KEY**: En el Dashboard de Supabase → Settings → API → Project API keys → service_role (⚠️ **NUNCA** expongas esta clave en el frontend)

## 🧪 Paso 4: Verificar la Configuración

### Opción 1: Mediante la UI

1. Inicia sesión en tu aplicación likethem
2. Navega a la sección de creación/edición de productos
3. Intenta subir una imagen
4. Verifica que la imagen aparece correctamente en el frontend

### Opción 2: Mediante el Dashboard de Supabase

1. Ve a **Storage** → **products**
2. Deberías ver las carpetas `likethem/products/` con las imágenes subidas
3. Haz clic en una imagen para ver su URL pública

### Opción 3: Mediante Script de Verificación

Puedes crear un script de prueba rápido:

```typescript
// scripts/test-storage.ts
import { getSupabaseServer } from '../lib/supabase-server';
import { checkBucketExists } from '../lib/storage';

async function testStorage() {
  console.log('Verificando configuración de Supabase Storage...');
  
  const bucketExists = await checkBucketExists();
  console.log('Bucket "products" existe:', bucketExists);
  
  if (!bucketExists) {
    console.error('❌ El bucket "products" no existe. Por favor, créalo en el Dashboard de Supabase.');
  } else {
    console.log('✅ Configuración correcta!');
  }
}

testStorage();
```

Ejecuta el script:

```bash
npx ts-node --compiler-options '{"module":"commonjs"}' scripts/test-storage.ts
```

## 📝 Estructura de Almacenamiento

Las imágenes se guardan con la siguiente estructura:

```
products/
└── likethem/
    └── products/
        ├── 1234567890-abc123def.jpg
        ├── 1234567891-xyz789ghi.png
        └── ...
```

Cada archivo tiene un nombre único generado con:
- Timestamp (milisegundos desde epoch)
- String aleatorio
- Extensión original del archivo

## 🔄 Migración desde Cloudinary

Si estás migrando desde Cloudinary:

1. **Las URLs antiguas seguirán funcionando**: Las imágenes existentes en Cloudinary no se eliminan automáticamente
2. **Nuevas subidas usan Supabase**: Todas las nuevas imágenes se subirán a Supabase Storage
3. **Formato de respuesta compatible**: La API mantiene el mismo formato de respuesta (`{ url, publicId, altText }`), por lo que no requiere cambios en el frontend

### Script de Migración (Opcional)

Si deseas migrar imágenes existentes de Cloudinary a Supabase, puedes crear un script personalizado:

```typescript
// scripts/migrate-cloudinary-to-supabase.ts
// Este es un ejemplo básico - ajústalo según tus necesidades

import { getSupabaseServer } from '../lib/supabase-server';
import fetch from 'node-fetch';

async function migrateImage(cloudinaryUrl: string) {
  // Descargar imagen de Cloudinary
  const response = await fetch(cloudinaryUrl);
  const buffer = await response.buffer();
  
  // Subir a Supabase
  const supabase = getSupabaseServer();
  const fileName = cloudinaryUrl.split('/').pop();
  
  const { data, error } = await supabase.storage
    .from('products')
    .upload(`migrated/${fileName}`, buffer, {
      contentType: response.headers.get('content-type') || 'image/jpeg',
    });
  
  if (error) {
    console.error('Error migrando:', cloudinaryUrl, error);
  } else {
    console.log('✅ Migrado:', cloudinaryUrl, '→', data.path);
  }
}

// Uso: migrateImage('https://res.cloudinary.com/...');
```

## 🛡️ Consideraciones de Seguridad

- ✅ **Service Role Key**: Solo se usa en el servidor, nunca se expone al frontend
- ✅ **Validación de archivos**: El API valida tipo y tamaño antes de subir
- ✅ **Límites**: Máximo 5 archivos por request, 5MB por archivo
- ✅ **Bucket público**: Solo para lectura. La escritura requiere autenticación

## 🚨 Solución de Problemas

### Error: "SUPABASE_SERVICE_ROLE_KEY is missing"

**Causa**: La variable de entorno no está configurada.

**Solución**: Agrega `SUPABASE_SERVICE_ROLE_KEY` a tu archivo `.env`.

### Error: "The resource already exists"

**Causa**: Estás intentando crear un bucket que ya existe.

**Solución**: Usa el bucket existente o elimínalo antes de crear uno nuevo.

### Error: "new row violates row-level security policy"

**Causa**: Las políticas RLS no están configuradas correctamente.

**Solución**: Revisa el Paso 2 y asegúrate de crear todas las políticas necesarias.

### Las imágenes no se cargan en el frontend

**Causa**: El dominio de Supabase no está en la lista de dominios permitidos en `next.config.js`.

**Solución**: Ya está configurado con el patrón `*.supabase.co`, pero verifica que `next.config.js` incluya:

```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: '*.supabase.co' },
    // ... otros dominios
  ],
}
```

## 📚 Recursos Adicionales

- [Documentación oficial de Supabase Storage](https://supabase.com/docs/guides/storage)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Límites y precios de Supabase Storage](https://supabase.com/pricing)

## ✅ Checklist de Configuración

- [ ] Bucket `products` creado en Supabase
- [ ] Bucket configurado como público
- [ ] Políticas RLS creadas (INSERT, DELETE, SELECT)
- [ ] Variables de entorno configuradas en `.env`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` presente y correcta
- [ ] Dominio de Supabase en `next.config.js`
- [ ] Subida de imágenes probada y funcionando
- [ ] Imágenes visibles en el frontend

---

**¿Necesitas ayuda?** Abre un issue en el repositorio con el label `storage` y describe tu problema.
# Supabase Storage Setup for Curator Assets

This document explains how to configure Supabase Storage for curator profile images (avatars and banners).

## Prerequisites

- Access to your Supabase project dashboard
- Service role key configured in `.env` as `SUPABASE_SERVICE_ROLE_KEY`
- Public URL configured in `.env` as `NEXT_PUBLIC_SUPABASE_URL`

## Setup Instructions

### 1. Create the Storage Bucket

1. Log in to your Supabase dashboard at https://supabase.com/dashboard
2. Navigate to your project
3. Go to **Storage** in the left sidebar
4. Click **New Bucket**
5. Create a new bucket with the following settings:
   - **Name**: `curator-assets`
   - **Public bucket**: Yes (enable public access)
   - **File size limit**: 5MB (recommended)
   - **Allowed MIME types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

### 2. Configure Storage Policies

To allow authenticated curators to upload and manage their images, set up the following RLS (Row Level Security) policies:

#### Policy 1: Allow authenticated users to upload files

```sql
CREATE POLICY "Curators can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'curator-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 2: Allow public read access

```sql
CREATE POLICY "Public can view all curator images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'curator-assets');
```

#### Policy 3: Allow users to update their own files

```sql
CREATE POLICY "Curators can update their own images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'curator-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy 4: Allow users to delete their own files

```sql
CREATE POLICY "Curators can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'curator-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### 3. Verify Configuration

After setting up the bucket and policies, verify:

1. The bucket `curator-assets` appears in your Storage dashboard
2. The bucket is marked as **Public**
3. All four policies are active in the Storage Policies section

## Usage

### Image Upload API

The application provides an API endpoint for uploading curator images:

**Endpoint**: `POST /api/curator/upload-image`

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `image`: File (max 5MB, JPG/PNG/WebP)
  - `type`: String ('avatar' or 'banner')

**Response**:
```json
{
  "message": "Image uploaded successfully",
  "url": "https://[project-id].supabase.co/storage/v1/object/public/curator-assets/[user-id]/banner-[timestamp].jpg",
  "path": "[user-id]/banner-[timestamp].jpg"
}
```

### Storage Structure

Images are organized by user ID:

```
curator-assets/
├── [user-id-1]/
│   ├── avatar-1234567890.jpg
│   └── banner-1234567890.jpg
├── [user-id-2]/
│   ├── avatar-9876543210.png
│   └── banner-9876543210.png
└── ...
```

## Environment Variables

Ensure these environment variables are set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

## Troubleshooting

### Images not uploading

1. Check that the bucket exists and is public
2. Verify the service role key is correct
3. Check browser console for error messages
4. Verify RLS policies are enabled

### Images not displaying

1. Ensure the bucket is marked as public
2. Check the public read policy is active
3. Verify the URL returned from the upload API is accessible

### Permission errors

1. Check that the user is authenticated
2. Verify the user has the CURATOR role
3. Check RLS policies match the user's ID

## Related Files

- **Storage Utilities**: `/lib/supabase-storage.ts`
- **Upload API**: `/app/api/curator/upload-image/route.ts`
- **Profile API**: `/app/api/curator/profile/route.ts`
- **Store Settings UI**: `/app/dashboard/curator/store/page.tsx`
