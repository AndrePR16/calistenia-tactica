# Calistenia Táctica — app funcional (Nivel 1)

Proyecto real (no mockup): backend en Node/Express + frontend en React (Vite).
Implementa las historias US-01 a US-13, US-27 y US-28 del backlog.

## Cómo correrlo tú mismo, en tu máquina

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run generate-data   # ya generado, solo si quieres regenerar el contenido
npm run dev             # http://localhost:4000
```

Verás en la consola: *"Modo desarrollo: los correos de acceso se guardan en
backend/data-store/emails/ en vez de enviarse de verdad."* — eso es
intencional (ver sección de correos abajo).

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Abre `http://localhost:5173` en el navegador.

## Cómo probarte la app a ti mismo, de punta a punta

1. **Simula que llegas por un anuncio**: abre
   `http://localhost:5173/?utm_source=tiktok` — te manda directo al test
   (US-28), no a una landing genérica.
2. Completa el test (peso, estatura, objetivo, experiencia, silueta) y
   presiona **"Ver mi recomendación"**.
3. Verás tu recomendación de nivel de inicio. Presiona **"Quiero este plan"**.
4. Ingresa tu correo y presiona **"Pagar y recibir accesos"** — esto simula
   el pago confirmado (todavía no está conectado Culqi de verdad, ver
   pendientes abajo).
5. La pantalla de éxito te muestra tu usuario y contraseña directamente
   (solo en modo desarrollo, para que no tengas que ir a buscar el correo).
   También puedes verlo en `backend/data-store/emails/` — ahí queda guardado
   el "correo" como si lo hubieras recibido de verdad.
6. Inicia sesión con esas credenciales.
7. Verás tu dashboard de 21 días: Día 1 disponible, el resto bloqueado. Arriba aparece tu programa (por ejemplo "NIVEL INTERMEDIO · FUERZA").
8. Entra al Día 1, avanza ejercicio por ejercicio (fíjate en el segundo
   ejercicio de la Semana 1, Día 1 — tiene pestañas "Con silla" / "Sin
   equipo" para que veas la variación funcionando).
9. Presiona **"Finalizar rutina"** en el último ejercicio — verás el sello de
   "Misión cumplida" y el Día 2 quedará desbloqueado.

## Qué es real y qué está simulado (para no llevarte sorpresas)

| Parte | Estado |
|---|---|
| Login, dashboard, rutina diaria, desbloqueo por día | **Real** — corre contra el backend, persiste en `backend/data-store/db.json` |
| Programas de 21 días: 3 niveles (Base / Intermedio / Avanzado) × 3 objetivos (fuerza / resistencia / pérdida de peso) = 9 programas | **Real** — la experiencia declarada decide el nivel y el objetivo decide el énfasis (ver "Cómo se asigna el programa"). Catálogo de 46 ejercicios con progresiones y alternativa sin barra. Se acortó de 30 a 21 días para respetar el descanso; la Fase 2 (28 días, más intensa) queda pendiente. |
| Recomendación de nivel según experiencia/objetivo | **Real**, reglas simples (ver `backend/src/utils/recommendation.js`) — define qué programa recibe cada usuario |
| Test antes de comprar (US-28) para tráfico de anuncios | **Real** — detecta `?utm_source=` y guarda el lead aunque no compre |
| Envío de correo con accesos (US-27) | **Simulado** — se guarda como archivo de texto en vez de enviarse. Ver abajo cómo activar el envío real. |
| Cobro con Culqi | **Simulado** — el botón "Pagar" llama directo al endpoint que crea la cuenta, sin pasar por una pasarela real todavía |
| Videos de ejercicios | **Temporal** — 26 de los 46 ejercicios tienen un GIF de `JahelCuadrado/ExerciseGymGifsDB` (no siempre muestra la técnica correcta, ver advertencia legal abajo); los 20 nuevos aún no tienen clip y la app muestra un recuadro "VIDEO: NOMBRE". Se reemplazan por clips propios `.mp4`. |

## De prueba local a producción

**⚠️ Lee primero esta advertencia sobre los GIFs — es la más urgente de las
cuatro, no la más técnica.**

0. **Licencia de los GIFs — resolver ANTES de cobrarle a un usuario real**:
   los 26 GIFs actuales (el resto del catálogo aún no tiene clip) vienen del repositorio público
   [`JahelCuadrado/ExerciseGymGifsDB`](https://github.com/JahelCuadrado/ExerciseGymGifsDB),
   servidos vía jsDelivr. Lo revisé y **ese repositorio no tiene un archivo
   `LICENSE`** — ni ahí ni, que yo haya encontrado, en su README. Sin una
   licencia explícita, el default legal es "todos los derechos reservados":
   está bien usarlo así mientras estás probando y desarrollando (que es
   exactamente lo que hicimos), pero **no es seguro venderlo así** sin
   confirmar permiso del autor. Antes de aceptar el primer pago real, elige
   una de estas:
   - Escribirle al autor del repo y pedir autorización explícita por escrito
     para uso comercial (lo más rápido si responde).
   - Contratar la versión de pago de ExerciseDB en RapidAPI, que sí tiene
     términos comerciales claros.
   - Grabar tú mismo los clips (46 ejercicios, ver `lista_ejercicios.md`) — con contenido que
     ya conoces bien, es más manejable de lo que sueles pensar, y te da
     control total sobre la calidad y el estilo.
   - No soy abogado, así que si tienes dudas de qué tan expuesto quedarías,
     esto es algo puntual que vale la pena confirmar con uno antes de lanzar.
   Mientras tanto, el archivo `backend/src/data/gif-map.json` es donde vive
   el mapeo ejercicio → GIF: cambiar la fuente es solo reemplazar esas 26
   URLs, no tocar el resto del código.

Otras tres cosas hay que resolver antes de vender esto de verdad, en este
orden:

1. **Correo real**: crea una cuenta en un proveedor SMTP (SendGrid, Mailgun,
   Resend, o el de tu propio hosting) y rellena `SMTP_HOST`, `SMTP_USER`,
   `SMTP_PASS` en `backend/.env`. El código de `utils/email.js` no cambia —
   deja de escribir el archivo de texto y empieza a mandar correos reales
   apenas detecta `SMTP_HOST`.

2. **Culqi real**: el endpoint `POST /api/purchase` hoy actúa como si el
   pago ya estuviera confirmado apenas alguien pone su correo — eso está
   bien para que tú lo prueben, pero **nunca debe quedar así en producción**
   porque cualquiera podría "comprar" sin pagar. Hay que:
   - Integrar el Checkout de Culqi en el frontend (paso de `email` + tarjeta/Yape).
   - Mover la creación de cuenta a un webhook que Culqi llama cuando el cargo
     se confirma de verdad (Culqi firma ese evento — hay que verificar la
     firma antes de confiar en él).

3. **Base de datos real**: `backend/data-store/db.json` es un archivo plano,
   perfecto para probar pero no para producción (no soporta escrituras
   concurrentes de verdad). Migrar a Postgres/MySQL es directo porque el
   "shape" de los datos ya está definido en `backend/src/db.js`.

## Cómo se asigna el programa

Cada persona recibe uno de 9 programas de 21 días, que siempre arranca en el día 1:

- **Nivel** (por experiencia previa): nunca entrené → **Base**, entrené antes →
  **Intermedio**, entreno actualmente → **Avanzado**.
- **Objetivo** (cambia el énfasis dentro del nivel): **fuerza** cierra cada día con
  empuje/tracción/pierna a una pierna y descansa más; **resistencia** cierra con
  cardio y descansa menos; **pérdida de peso** agrega un bloque de cardio extra
  (6 ejercicios) y descansa menos.
- **Barra opcional**: los ejercicios con barra (dominadas, colgados, remo en barra
  baja…) tienen siempre una alternativa "sin equipo", y la app avisa cuándo toca
  un día de barra.

Todo sale de `backend/src/data/generate-data.js` (3 programas escritos a mano + las
reglas del objetivo) y queda en `programs.json`. Para ajustar contenido: edita ese
archivo y corre `npm run generate-data`; el generador valida que no haya ejercicios
repetidos dentro de un mismo día ni ejercicios con barra sin alternativa.

## Decisión de diseño: la silueta corporal no cambia la dificultad

En el test verás una pregunta de "silueta con la que te identificas", con
opciones neutrales (delgado/promedio/atlético/contextura mayor). Se guarda,
pero **no se usa para decidir si la rutina es más fácil o más difícil** —
eso lo decide únicamente la experiencia previa (`backend/src/utils/recommendation.js`).
Está documentado en el código por si más adelante quieres cambiarlo, pero
usar el cuerpo de alguien para "colocarlo" en un nivel es justo el tipo de
suposición que puede sentirse ofensiva.
