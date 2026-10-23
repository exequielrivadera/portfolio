# Portfolio — Pulso Digital

Portfolio estático en HTML, CSS y JavaScript. Incluye capturas reales de cinco sitios y una ficha descriptiva para DocuCentral, aplicación de escritorio sin demo web pública.

## Ejecutar localmente

Abrir `index.html` en el navegador o usar Live Server desde VS Code.

## Publicar en GitHub Pages

1. Subir el contenido de esta carpeta a la raíz del repositorio `portfolio`.
2. Ir a Settings → Pages.
3. Elegir Deploy from a branch, rama `main`, carpeta `/(root)`.

## Demos

- Rivaside Records: https://exequielrivadera.github.io/rivasiderecordspage/
- Pulso Digital: https://exequielrivadera.github.io/pulsodigitalproyecto/
- Distribuidora: https://exequielrivadera.github.io/proyectobebidas/
- Pastelería: https://exequielrivadera.github.io/pasteleria/
- Indumentaria: https://exequielrivadera.github.io/proyectoindumentaria/

DocuCentral se presenta como proyecto de software de escritorio, sin enlace de demo. No se enlazan repositorios originales.

## Contacto

WhatsApp: https://wa.me/5493804507584
Instagram: https://www.instagram.com/pulsodigital.lr/
LinkedIn: https://www.linkedin.com/in/claudio-exequiel-rivadera-308611377/
Facebook: https://www.facebook.com/profile.php?id=61583352606803
Google: enlace de opiniones incluido en el sitio.


### Identidad visual
- Paleta editorial: negro carbón, blanco cálido y acentos bordó/rojo suave.
- El portfolio incluye el logo original de Pulso Digital y una fotografía personal proporcionada por el titular.
- No se enlazan los repositorios de código originales; las tarjetas abren únicamente las demos publicadas en GitHub Pages.

### Animación de entrada
La notebook entra desde la izquierda y luego el celular desde la derecha con animaciones CSS. No requiere Bootstrap ni JavaScript adicional y respeta la preferencia del navegador para reducir movimiento.


## Animación de bienvenida

Cada vez que se abre o recarga el portfolio, aparece una introducción breve con el isotipo de Pulso Digital. Un barrido rojo recorre la silueta y la portada se revela suavemente. Si el visitante tiene activada la preferencia para reducir movimiento, la bienvenida permanece estática y dura menos tiempo. No requiere librerías adicionales.


### Corrección de la intro
La pantalla de bienvenida se muestra desde el primer render del HTML, antes de que JavaScript ejecute la secuencia, para evitar un destello de la portada principal antes del logo. La intro se repite en cada carga o recarga.


### Divisores animados
Los tres divisores incorporan un destello rojo activado al entrar en pantalla: el primero y el tercero avanzan de izquierda a derecha; el segundo, de derecha a izquierda. La animación respeta la preferencia del sistema para reducir movimiento.


### Divisores animados
Los tres destellos se vuelven a activar al entrar de nuevo en sus zonas durante el scroll. El primero observa directamente la línea divisoria de la portada para evitar que la animación se dispare antes de que llegue a verse.

### Línea del footer (electrocardiograma)
Al llegar al footer, un electrocardiograma rojo recorre la línea divisoria de izquierda a derecha (6,2 s), visible por encima y por debajo de ella. Se reproduce una sola vez por carga de página. El efecto está en `.footer-ecg` (style.css) y se activa con la clase `heartbeat-played` desde script.js.


## Pulso Arcade

Debajo de la sección “Sobre mí” se añadió una sección de minijuegos retro. Los juegos se abren en una ventana emergente dentro de la página y funcionan localmente en el navegador, sin dependencias externas ni servidor:

- **Python — Pixel Snake:** juego de serpiente con teclado y controles táctiles.
- **JavaScript — Pulso de reacción:** mide el tiempo de reacción.
- **CSS — Pixel Match:** juego de memoria con parejas.
- **HTML — Code Breaker:** ordenar una estructura HTML.
- **C / C++ — Pixel Invaders:** minijuego arcade de disparos.
- **MySQL — Detective de datos:** elegir una consulta SQL correcta.

Los juegos son demostraciones interactivas inspiradas en las tecnologías; no ejecutan Python, C/C++ o SQL reales en el navegador. La lógica de cada minijuego está implementada en JavaScript.


### Actualización del arcade

- Las tarjetas de tecnologías usan SVG locales en `assets/tech-logos/`.
- Cada minijuego incorpora una pestaña educativa que explica qué conceptos del lenguaje o tecnología representa. La lógica interactiva de las demos se ejecuta en JavaScript en el navegador.
- Pixel Invaders incluye tres niveles progresivos: los enemigos aparecen con más frecuencia y se mueven más rápido, y la nave responde con mayor velocidad. Los objetivos de puntuación son 100, 250 y 450 puntos.
