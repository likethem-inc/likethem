# Guía Visual: Registro de Usuario en LikeThem

## 📱 Experiencia del Usuario

### Paso 1: Acceder a la Página de Registro

**URL**: `http://localhost:3000/auth/signup`

#### Formas de llegar a la página:
1. **Desde el header**: Click en "Sign In" → Click en "Sign up" en la página de login
2. **URL directa**: Navegar a `/auth/signup`
3. **Redirección automática**: Al intentar acceder a páginas protegidas sin estar autenticado

---

### Paso 2: Visualizar el Formulario de Registro

La página de registro muestra:

```
┌─────────────────────────────────────────────┐
│                                             │
│         🔙 Back to Home                     │
│                                             │
│      Create your account                    │
│   Join LikeThem and start discovering       │
│        curated fashion                      │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │                                     │   │
│  │  [G] Continue with Google           │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ────────── Or sign up with email ────────  │
│                                             │
│  Full name                                  │
│  ┌─────────────────────────────────────┐   │
│  │ 👤 Enter your full name            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Email address                              │
│  ┌─────────────────────────────────────┐   │
│  │ ✉️  Enter your email                │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Password                                   │
│  ┌─────────────────────────────────────┐   │
│  │ 🔒 Create a password            👁️  │   │
│  └─────────────────────────────────────┘   │
│  Must be at least 8 characters              │
│                                             │
│  Confirm password                           │
│  ┌─────────────────────────────────────┐   │
│  │ 🔒 Confirm your password         👁️  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │      Create account                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Already have an account? Sign in           │
│                                             │
│  By creating an account, you agree to our   │
│  Terms of Service and Privacy Policy        │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Paso 3: Completar el Formulario

#### Ejemplo de datos válidos:

```
Full name:        María García
Email address:    maria@example.com
Password:         MiContraseña123
Confirm password: MiContraseña123
```

#### Validaciones en tiempo real:

1. **Campo vacío**: 
   - Si dejas un campo vacío → "Name is required"

2. **Email inválido**:
   - Si escribes "notanemail" → "Please enter a valid email address"

3. **Password corta**:
   - Si escribes "corta1" (6 chars) → "Password must be at least 8 characters long"

4. **Passwords no coinciden**:
   - Password: "Contraseña123"
   - Confirm: "Contraseña456"
   - → "Passwords do not match"

---

### Paso 4: Enviar el Formulario

Al hacer click en **"Create account"**:

```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐   │
│  │         ⏳ Loading...               │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

El botón muestra un spinner de carga mientras se procesa el registro.

---

### Paso 5: Registro Exitoso

Si el registro es exitoso:

1. **Usuario creado en base de datos** ✅
2. **Auto-login automático** ✅
3. **Redirección a página de destino** ✅
4. **Sesión iniciada** ✅

```
┌─────────────────────────────────────────────┐
│  LIKETHEM       Viste Como Ellos    Vende   │
│                                    🌐 🤍 🛒 👤│
│                                              │
│  [María García ▼]  ← Usuario logueado       │
│                                              │
└──────────────────────────────────────────────┘
```

En el header aparece el nombre del usuario con un menú dropdown.

---

### Paso 6: Verificar Cuenta Creada

El usuario ya puede:

- ✅ Ver su nombre en el header
- ✅ Acceder a `/account` (configuración)
- ✅ Acceder a `/orders` (pedidos)
- ✅ Agregar productos al carrito
- ✅ Seguir curadores
- ✅ Guardar favoritos

---

## 🚨 Casos de Error

### Error 1: Email Duplicado

Si el email ya existe:

```
┌─────────────────────────────────────────────┐
│  ┌──────────────────────────────────────┐  │
│  │ ❌ User with this email already exists │ │
│  └──────────────────────────────────────┘  │
│                                             │
│  Email address                              │
│  ┌─────────────────────────────────────┐   │
│  │ ✉️  duplicate@example.com           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Solución**: Usar otro email o ir a "Sign in"

---

### Error 2: Contraseñas No Coinciden

```
┌─────────────────────────────────────────────┐
│  ┌──────────────────────────────────────┐  │
│  │ ❌ Passwords do not match              │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Password                                   │
│  ┌─────────────────────────────────────┐   │
│  │ 🔒 Password123                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Confirm password                           │
│  ┌─────────────────────────────────────┐   │
│  │ 🔒 Password456                      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Solución**: Asegurarse de escribir la misma contraseña en ambos campos

---

### Error 3: Contraseña Muy Corta

```
┌─────────────────────────────────────────────┐
│  ┌──────────────────────────────────────┐  │
│  │ ❌ Password must be at least 8         │  │
│  │    characters long                     │  │
│  └──────────────────────────────────────┘  │
│                                             │
│  Password                                   │
│  ┌─────────────────────────────────────┐   │
│  │ 🔒 corta1                           │   │
│  └─────────────────────────────────────┘   │
│  Must be at least 8 characters              │
└─────────────────────────────────────────────┘
```

**Solución**: Usar una contraseña de al menos 8 caracteres

---

## 🔄 Navegación Entre Páginas

### De Sign In a Sign Up

```
Sign In Page                    Sign Up Page
    │                               ▲
    │  "Don't have an              │
    │   account? Sign up"          │
    └──────────────────────────────┘
```

### De Sign Up a Sign In

```
Sign Up Page                    Sign In Page
    │                               ▲
    │  "Already have an            │
    │   account? Sign in"          │
    └──────────────────────────────┘
```

---

## 🔐 Funcionalidades de Contraseña

### Toggle de Visibilidad

**Estado inicial** (password oculta):
```
┌─────────────────────────────────────┐
│ 🔒 •••••••••••••                👁️  │
└─────────────────────────────────────┘
```

**Después de click en 👁️** (password visible):
```
┌─────────────────────────────────────┐
│ 🔒 MiContraseña123              🚫  │
└─────────────────────────────────────┘
```

Ambos campos (Password y Confirm Password) tienen su propio toggle.

---

## 📊 Flujo Completo en Diagrama

```
  START
    ↓
┌─────────────────────┐
│  Usuario accede a   │
│  /auth/signup       │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Visualiza          │
│  formulario         │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Completa campos:   │
│  - Name             │
│  - Email            │
│  - Password         │
│  - Confirm Password │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Click "Create      │
│  account"           │
└──────────┬──────────┘
           ↓
     ┌────┴────┐
     │ Valid?  │
     └────┬────┘
          │
    No ◄──┴──► Yes
    │          │
    ↓          ↓
┌──────┐  ┌──────────────┐
│ Show │  │ API Request  │
│Error │  │ POST /signup │
└──┬───┘  └──────┬───────┘
   │             ↓
   │      ┌────────────┐
   │      │  Create    │
   │      │  User in   │
   │      │  Database  │
   │      └──────┬─────┘
   │             ↓
   │      ┌────────────┐
   │      │ Auto-login │
   │      │ with       │
   │      │ NextAuth   │
   │      └──────┬─────┘
   │             ↓
   │      ┌────────────┐
   │      │ Redirect   │
   │      │ to Home    │
   │      └──────┬─────┘
   │             ↓
   └─────────► END
                (Logged In)
```

---

## ✅ Checklist de Funcionalidad

Para verificar que todo funciona correctamente:

### Campos del Formulario
- [ ] Campo "Full name" visible y funcional
- [ ] Campo "Email address" visible y funcional
- [ ] Campo "Password" visible y funcional
- [ ] Campo "Confirm password" visible y funcional
- [ ] Todos los campos tienen iconos apropiados
- [ ] Todos los campos tienen placeholders

### Validaciones
- [ ] Validación de nombre vacío
- [ ] Validación de email vacío
- [ ] Validación de formato de email
- [ ] Validación de password corta (< 8 chars)
- [ ] Validación de passwords no coinciden
- [ ] Mensajes de error claros y visibles

### Interacciones
- [ ] Toggle de visibilidad de password funciona
- [ ] Toggle de visibilidad de confirm password funciona
- [ ] Botón "Create account" muestra loading state
- [ ] Errores se muestran en un alert rojo
- [ ] Link "Sign in" funciona
- [ ] Link "Back to Home" funciona

### Funcionalidad
- [ ] Usuario se crea en base de datos
- [ ] Password se guarda hasheada (no plain text)
- [ ] Auto-login después de registro
- [ ] Redirección después de registro
- [ ] Email duplicado es rechazado
- [ ] Sesión persiste después de reload

### Experiencia de Usuario
- [ ] Animaciones suaves al cargar página
- [ ] Diseño responsive en mobile
- [ ] Todos los botones tienen hover effects
- [ ] Loading states son visibles
- [ ] No hay errores en consola

---

## 🎯 Resumen de Criterios de Éxito

| Criterio | Estado | Implementación |
|----------|--------|----------------|
| Registro sin Google | ✅ | Campo email/password independiente de OAuth |
| Campos Nombre, Email, Password | ✅ | Tres campos presentes y requeridos |
| Confirmación de Password | ✅ | Campo "Confirm password" con validación |

---

## 📞 Soporte y Documentación

Para más información técnica, consulta:

- **Documentación técnica**: `/docs/REGISTRO_USUARIO.md`
- **Guía de testing**: `/docs/TESTING_REGISTRO.md`
- **Resumen ejecutivo**: `/docs/SUMMARY.md`

---

**Última actualización**: 2026-01-28
**Estado**: ✅ Funcional y probado
