# Registro de Usuario - Documentación

## Resumen

El sistema de registro de usuarios en **likethem** está completamente implementado y funcional. Los usuarios pueden crear cuentas utilizando su nombre, correo electrónico y contraseña, sin necesidad de autenticarse con Google.

## Criterios de Éxito Cumplidos ✅

1. ✅ **Registro sin autenticación con Google**: Los usuarios pueden registrarse usando email y contraseña
2. ✅ **Campos requeridos**: Nombre, correo electrónico y contraseña
3. ✅ **Validación de contraseña**: Sistema de confirmación de contraseña (dos campos)

## Arquitectura de la Funcionalidad

### 1. Página de Registro (`/app/auth/signup/page.tsx`)

**Ubicación**: `/auth/signup`

**Características**:
- Formulario con campos para:
  - Nombre completo
  - Correo electrónico
  - Contraseña (con toggle para mostrar/ocultar)
  - Confirmación de contraseña (con toggle para mostrar/ocultar)
- Botón de registro con Google (opcional)
- Validaciones en el cliente:
  - Nombre requerido
  - Email requerido y formato válido
  - Contraseña mínimo 8 caracteres
  - Las contraseñas deben coincidir
- Auto-login después de registro exitoso
- Redirección inteligente basada en contexto
- Manejo de errores con mensajes claros
- Diseño responsivo con animaciones (Framer Motion)
- Estados de carga para mejor UX

### 2. API de Registro (`/app/api/auth/signup/route.ts`)

**Endpoint**: `POST /api/auth/signup`

**Body esperado**:
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "contraseña123",
  "role": "BUYER"
}
```

**Validaciones del servidor**:
- Email y password son requeridos
- Nombre es requerido
- Contraseña mínimo 8 caracteres
- Email debe tener formato válido
- Email no debe estar ya registrado
- Para curadores, se requiere storeName

**Seguridad**:
- Hash de contraseña con bcrypt (12 rounds)
- Transacción de base de datos para integridad
- No se devuelve el passwordHash en la respuesta
- Validación contra usuarios duplicados

**Respuesta exitosa (201)**:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "cuid...",
    "email": "juan@example.com",
    "name": "Juan Pérez",
    "role": "BUYER"
  }
}
```

### 3. Autenticación (NextAuth + Credentials)

**Configuración**: `/lib/auth.ts`

**Providers disponibles**:
1. **Google OAuth** - Opcional, para quienes prefieran OAuth
2. **Credentials** - Email y contraseña (el que nos importa)

**CredentialsProvider**:
- Valida email y password
- Compara password hash con bcrypt
- Retorna datos del usuario si las credenciales son válidas
- Incluye información del perfil de curator si existe

**Flujo de autenticación**:
1. Usuario se registra con `/api/auth/signup`
2. Sistema crea usuario en BD con password hasheado
3. Auto-login usando NextAuth signIn con credentials
4. JWT contiene role, email, y otros datos del usuario
5. Session persiste por 30 días

### 4. Modelo de Base de Datos

**Tabla**: `users`

**Campos relevantes**:
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?   // Para usuarios con credentials
  name          String?
  provider      String?   // "google" o "credentials"
  role          Role      @default(BUYER)
  // ... otros campos
}
```

**Enum de roles**:
```prisma
enum Role {
  ADMIN
  CURATOR
  BUYER
}
```

## Flujo de Usuario

1. **Usuario accede a `/auth/signup`**
2. **Completa el formulario**:
   - Nombre: "María García"
   - Email: "maria@example.com"
   - Password: "MiContraseña123"
   - Confirm Password: "MiContraseña123"
3. **Click en "Create account"**
4. **Validaciones del cliente**:
   - ✓ Nombre no vacío
   - ✓ Email tiene formato correcto
   - ✓ Password >= 8 caracteres
   - ✓ Passwords coinciden
5. **Request a `/api/auth/signup`**
6. **Validaciones del servidor**:
   - ✓ Email no existe en BD
   - ✓ Campos requeridos presentes
   - ✓ Password length válido
7. **Creación de usuario**:
   - Hash de password con bcrypt
   - Insert en base de datos
   - Role = "BUYER" por defecto
8. **Auto-login**:
   - NextAuth signIn con credentials
   - Creación de JWT
   - Establecimiento de session
9. **Redirección**:
   - Si vino de `/sell` → redirige a `/sell`
   - Si es curator → redirige a `/dashboard/curator`
   - Por defecto → redirige a `/`

## Seguridad Implementada

### Hashing de Contraseñas
- **Algoritmo**: bcrypt
- **Rounds**: 12 (signup) / 10 (register)
- **Salt**: Generado automáticamente por bcrypt

### Validaciones
- Email único en base de datos (constraint)
- Longitud mínima de contraseña: 8 caracteres
- Validación de formato de email (regex)
- Confirmación de contraseña en el cliente

### Protección de Datos
- `passwordHash` nunca se envía al cliente
- JWT para manejo de sesiones (más seguro que cookies de sesión)
- CSRF protection mediante NextAuth
- HttpOnly cookies para tokens de sesión

## Diferencias entre `/api/auth/signup` y `/api/auth/register`

Existen **dos endpoints** de registro:

### `/api/auth/signup`
- Más completo
- Soporta creación de BUYERS y CURATORS
- Maneja curator profiles (storeName, bio, etc.)
- Usa transacciones de BD
- 12 rounds de bcrypt

### `/api/auth/register`
- Más simple
- Solo para BUYERS
- No maneja curator profiles
- Sin transacciones
- 10 rounds de bcrypt
- Más logging

**Recomendación**: Usar `/api/auth/signup` (es el que usa la UI actual)

## Testing Manual

### Caso de Prueba 1: Registro Exitoso

1. Ir a `http://localhost:3000/auth/signup`
2. Llenar formulario:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "TestPassword123"
   - Confirm Password: "TestPassword123"
3. Click "Create account"
4. **Resultado esperado**: 
   - Usuario creado en BD
   - Auto-login exitoso
   - Redirección a página principal

### Caso de Prueba 2: Passwords No Coinciden

1. Ir a `/auth/signup`
2. Llenar formulario con passwords diferentes:
   - Password: "TestPassword123"
   - Confirm Password: "TestPassword456"
3. Click "Create account"
4. **Resultado esperado**: 
   - Error: "Passwords do not match"
   - No se envía request al servidor

### Caso de Prueba 3: Email Ya Registrado

1. Registrar usuario con email "duplicate@example.com"
2. Intentar registrar otro usuario con mismo email
3. **Resultado esperado**:
   - Error: "User with this email already exists"
   - Usuario no duplicado en BD

### Caso de Prueba 4: Password Muy Corta

1. Ir a `/auth/signup`
2. Llenar formulario con password de 5 caracteres
3. Click "Create account"
4. **Resultado esperado**:
   - Error: "Password must be at least 8 characters long"
   - No se envía request al servidor

## Mejoras Futuras (Opcionales)

Si se quisiera mejorar aún más (no requerido por el issue):

1. **Verificación de email**: Enviar email de confirmación
2. **Fuerza de contraseña**: Indicador visual de seguridad
3. **Prevención de emails desechables**: Lista de dominios bloqueados
4. **Captcha**: Para prevenir bots
5. **Rate limiting**: Limitar intentos de registro
6. **Password recovery**: Sistema de "olvidé mi contraseña" (ya existe en `/api/auth/forgot-password`)

## Conclusión

✅ **La funcionalidad solicitada está 100% implementada y funcional.**

Los usuarios pueden:
- Registrarse sin usar Google OAuth
- Crear cuenta con Nombre, Email y Password
- Confirmar su contraseña (dos campos) para evitar errores

El sistema incluye:
- Validaciones robustas (cliente y servidor)
- Seguridad apropiada (bcrypt, validaciones)
- UX excelente (animaciones, estados de carga, mensajes claros)
- Integración completa con NextAuth y la BD
