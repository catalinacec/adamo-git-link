# Adamo API

Una API desarrollada con Node.js, Express y MongoDB utilizando TypeScript.

## Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Documentación de la API](#documentación-de-la-api)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts de NPM](#scripts-de-npm)
- [Autor](#autor)

## Características

- **Registro y autenticación de usuarios:** Permite registrar y autenticar usuarios.
- **Recuperación de contraseña con OTP:** Solicita OTP, lo verifica y genera una clave temporal para el cambio de contraseña.
- **Cambio de contraseña:**
  - Mediante OTP y clave temporal.
  - Mediante autenticación por token (JWT).
- **Documentación integrada:** Documentación interactiva con Swagger/OpenAPI.
- **Arquitectura escalable:** Basada en principios SOLID y arquitectura hexagonal, separando la lógica de negocio, la infraestructura y la presentación.

## Requisitos

- **Node.js:** v20 o superior.
- **npm o yarn**
- **MongoDB:** Local o en la nube (por ejemplo, MongoDB Atlas). (Adjunto mi credencial para pruebas en el correo enviado y la cadena de conexion igualmente)
- **TypeScript**

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/tuusuario/adamo-api.git
   cd adamo-api
   ```

2. **Instala las dependencias:**

   ```bash
   npm install
   ```

## Configuración

Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables (ajústalas según tu entorno y proveedor de correo). Dejo un env.example de ejemplo (Por temas de seguridad de Github compartiré lo mismo por correo):

```env
PORT=3500
MONGO_URI=mongodb+srv://usuario:contraseña@cluster0.lmccw.mongodb.net/nombreDeTuBase?retryWrites=true&w=majority
JWT_SECRET=TuJWTSecret
OTP_EXPIRATION_MINUTES=15

# Configuración SMTP (para envío de correos)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-usuario@example.com
SMTP_PASS=tu-contraseña
SMTP_FROM="Tu Empresa <no-reply@tudominio.com>"
```

## Uso

### En Desarrollo

Para iniciar la aplicación en modo desarrollo (con reinicio automático en caso de cambios):

```bash
npm run dev
```

### Compilación y Producción

1. **Compilar el proyecto:**

   ```bash
   npm run build
   ```

   Esto generará la carpeta `dist` con los archivos compilados en JavaScript.

2. **Iniciar la aplicación en producción:**

   ```bash
   npm start
   ```

## Documentación de la API

Una vez iniciada la aplicación, accede a la documentación interactiva en:  
[http://localhost:3500/api-docs](http://localhost:3500/api-docs)

## Estructura del Proyecto

La organización del proyecto sigue una arquitectura hexagonal y principios SOLID:

```
adamo-api/
├── src/
│   ├── adapters/          # Adaptadores: Controladores HTTP, rutas
│   ├── application/       # Casos de uso y lógica de negocio
│   ├── config/            # Configuración (variables de entorno, Swagger)
│   ├── domain/            # Entidades y repositorios
│   ├── infrastructure/    # Implementación de repositorios y conexión a la base de datos
│   ├── utils/             # Funciones auxiliares
│   └── index.ts           # Punto de entrada de la aplicación
├── .env                   # Variables de entorno
├── .gitignore             # Archivos a ignorar por Git
├── package.json           # Dependencias y scripts del proyecto
├── tsconfig.json          # Configuración de TypeScript
└── README.md              # Este archivo
```

## Scripts de NPM

- **`npm run dev`**: Inicia el servidor en modo desarrollo.
- **`npm run build`**: Compila el proyecto TypeScript a JavaScript (carpeta `dist`).
- **`npm start`**: Ejecuta la aplicación desde los archivos compilados.
- **`npm test`**: Ejecuta las pruebas (por definir).

<!-- COMANDOS DOCKER -->
<!-- docker build -f Dockerfile.build -t lambda-builder . -->

## Autor

**Alvaro Chico**
