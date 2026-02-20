# Guía de Despliegue a Producción para Verso

Para llevar tu aplicación a producción y que cualquier usuario pueda acceder a ella (usando una URL pública), un simple `git push origin main` no es suficiente por sí solo, a menos que ya tengas configurado un servicio de alojamiento continuo (como Vercel, Netlify o Firebase Hosting).

Aquí tienes los pasos recomendados para desplegar esta aplicación React + Vite:

## 1. Construir la versión de Producción (Build)
Antes de subir cualquier código, necesitas compilar tu aplicación para que esté optimizada y minificada.

```bash
npm run build
```
Esto creará una carpeta llamada `dist/` en tu proyecto. Esta carpeta contiene los archivos estáticos HTML, CSS y JS optimizados que el navegador finalmente lee.

## 2. Elegir una Plataforma de Frontend
Dado el stack que usas (React + Firebase), la opción más natural y gratuita es **Firebase Hosting**. Sin embargo, **Vercel** o **Netlify** también son excelentes alternativas con despliegue automático conectado a GitHub.

### Opción A (Recomendada): Vercel o Netlify
Si ya tienes el proyecto en GitHub, esta es la forma más fácil en la que un `git push origin main` **sí** actualizará tu sitio automáticamente.
1. Ve a [vercel.com](https://vercel.com/) o [netlify.com](https://netlify.com/) y crea una cuenta con GitHub.
2. Selecciona "Add New Project" o "Import from Git".
3. Conecta tu repositorio de GitHub donde está `Ensayemos_tsx`.
4. El framework (Vite) será detectado automáticamente.
5. **¡Muy Importante!**: En la sección de la plataforma llamada **Environment Variables** (Variables de Entorno), debes agregar tu clave de Gemini allí como: `GEMINI_API_KEY` = `[tu_clave]`. El archivo `.env` que creamos no se sube a GitHub por seguridad, así que la plataforma en la nube necesita saber cuál es la clave.
6. Haz clic en **Deploy**. 

Desde ese momento, cada vez que hagas un `git push origin main` en tu repositorio, Vercel/Netlify construirá y desplegará la nueva versión automáticamente.

### Opción B: Firebase Hosting
Dado que ya usas Firebase para la autenticación y la base de datos (Firestore), puedes alojar la web allí mismo.
1. Instala las herramientas de Firebase en tu terminal: `npm install -g firebase-tools`
2. Inicia sesión en tu cuenta de Google desde la terminal: `firebase login`
3. Inicializa el proyecto en tu carpeta: `firebase init hosting`
   * Selecciona tu proyecto existente de Verso.
   * Selecciona la carpeta `dist` como el directorio público.
   * Dile que **SÍ** a "Configure as a single-page app".
4. Construye tu código: `npm run build`
5. Sube tu página: `firebase deploy --only hosting`

## 3. Consideraciones Críticas de Seguridad antes de Lanzar

Antes de compartir tu URL pública final con usuarios reales, recuerda nuestro **Análisis de Seguridad** previo. En un entorno de producción real, **no se recomienda en absoluto** hacer las llamadas a la API de Gemini directamente desde el frontend (Vite/React), ya que la clave API (la que pusiste en el archivo `.env`) queda expuesta en el código compilado del navegador. Cualquier visitante con conocimientos técnicos podría robar tu clave a través de la pestaña de red de su navegador y consumir tu cuota de Google AI gratuitamente.

**Para uso de banda cerrada/privada:** Puedes seguir así sin problema.
**Para un lanzamiento masivo/público al mundo:** Debes mover la lógica de pedir canciones a Gemini a un servidor Backend propio o utilizar Firebase Cloud Functions para proteger tu API Key.
