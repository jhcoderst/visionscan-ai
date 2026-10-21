# VisionScan AI

Aplicación web para detectar objetos desde la cámara o cargar una imagen y analizarla con IA usando Gemini.

## Requisitos del entorno
- Node.js 18+
- npm
- Android Studio
- Java 17+
- clave API de Gemini

## Configuración
1. `npm install`
2. Crear `.env` con:
   ```env
   GEMINI_API_KEY=tu_api_key
   PORT=3000
   ```
3. `npm start`

## APK wrapper
Este proyecto está preparado para envolverse como una app Android con Capacitor.

### Pasos:
```bash
npm install
npx cap add android
npm run android:sync
npm run android:open
```

Luego, desde Android Studio:
- Build > Build Bundle(s)/APK
- Genera el APK en modo debug o release

## Nota
El APK real solo se genera con Android Studio/SDK instalado localmente.
