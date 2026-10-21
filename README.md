# VisionScan AI

Aplicación web para detectar objetos desde la cámara o cargar una imagen y analizarla con IA usando Gemini.

## Características
- Captura desde cámara del dispositivo
- Carga de imagen manual
- Escaneo automático opcional
- Síntesis de voz en español
- Historial local en el navegador
- Backend seguro con API key de Gemini en servidor
- Preparado para empaquetado Android con Capacitor como wrapper APK

## Requisitos
- Node.js 18+
- npm
- Android Studio
- Java JDK 17+
- Una clave de API de Google Gemini

## Instalación web

1. Instala dependencias:

```bash
npm install
```

2. Crea un archivo `.env` en la raíz con tu API key:

```env
GEMINI_API_KEY=tu_api_key_aqui
PORT=3000
```

3. Inicia la app:

```bash
npm start
```

4. Abre en navegador:

```text
http://localhost:3000
```

## Empaquetado Android / APK wrapper

Este proyecto ya está preparado para convertirse en una app Android usando Capacitor.

### 1) Instala Capacitor y agrega Android

```bash
npm install
npx cap add android
```

### 2) Sincroniza los archivos web con Android

```bash
npm run android:sync
```

### 3) Abre Android Studio

```bash
npm run android:open
```

### 4) Genera el APK de depuración

```bash
npm run android:build
```

Esto genera el APK en:

```text
android/app/build/outputs/apk/debug/
```

## Seguridad
La clave de Gemini no se expone en el frontend. Se maneja en el backend con variables de entorno.

## Nota importante
La app web base funciona en navegador. Para generar el APK final, necesitas tener Android Studio y Android SDK instalados en tu equipo.

## Estructura del proyecto

```text
visionscan-ai/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .gitignore
├── .env.example
├── package.json
├── server.js
├── capacitor.config.ts
├── README.md
└── android/   (creado después de npx cap add android)
```
