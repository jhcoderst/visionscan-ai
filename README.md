# VisionScan AI

Aplicación web para detectar objetos desde la cámara o cargar una imagen y analizarla con IA usando Gemini.

## Características
- Captura desde cámara del dispositivo
- Carga de imagen manual
- Escaneo automático opcional
- Síntesis de voz en español
- Historial local en el navegador
- Backend seguro con API key de Gemini en servidor

## Requisitos
- Node.js 18+
- Una clave de API de Google Gemini

## Instalación

1. Clona el repositorio
2. Instala dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz con tu API key:

```env
GEMINI_API_KEY=tu_api_key_aqui
PORT=3000
```

4. Inicia la app:

```bash
npm start
```

5. Abre la siguiente URL en tu navegador:

```text
http://localhost:3000
```

## Seguridad
La clave de Gemini no se expone en el frontend. Se maneja en el backend con variables de entorno.

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
└── README.md
```

## Notas
Este proyecto está pensado como base funcional para pruebas, demos y prototipos de visión AI.
