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
7. Verás tu dashboard de 30 días: Día 1 disponible, el resto bloqueado.
8. Entra al Día 1, avanza ejercicio por ejercicio (fíjate en el segundo
   ejercicio de la Semana 1, Día 1 — tiene pestañas "Con silla" / "Sin
   equipo" para que veas la variación funcionando).
9. Presiona **"Finalizar rutina"** en el último ejercicio — verás el sello de
   "Misión cumplida" y el Día 2 quedará desbloqueado.

## Qué es real y qué está simulado (para no llevarte sorpresas)

| Parte | Estado |
|---|---|
| Login, dashboard, rutina diaria, desbloqueo por día | **Real** — corre contra el backend, persiste en `backend/data-store/db.json` |
| Catálogo de 30 días + variaciones sin equipo | **Real** — mismo contenido que ya habíamos validado (0 repeticiones por semana) |
| Recomendación de nivel según experiencia/objetivo | **Real**, reglas simples (ver `backend/src/utils/recommendation.js`) |
| Test antes de comprar (US-28) para tráfico de anuncios | **Real** — detecta `?utm_source=` y guarda el lead aunque no compre |
| Envío de correo con accesos (US-27) | **Simulado** — se guarda como archivo de texto en vez de enviarse. Ver abajo cómo activar el envío real. |
| Cobro con Culqi | **Simulado** — el botón "Pagar" llama directo al endpoint que crea la cuenta, sin pasar por una pasarela real todavía |
| Videos de ejercicios | **Placeholder** — el catálogo trae una URL de ejemplo (`video_url`) que hay que reemplazar por tus videos reales |

## De prueba local a producción

Tres cosas hay que resolver antes de vender esto de verdad, en este orden:

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

## Decisión de diseño: la silueta corporal no cambia la dificultad

En el test verás una pregunta de "silueta con la que te identificas", con
opciones neutrales (delgado/promedio/atlético/contextura mayor). Se guarda,
pero **no se usa para decidir si la rutina es más fácil o más difícil** —
eso lo decide únicamente la experiencia previa (`backend/src/utils/recommendation.js`).
Está documentado en el código por si más adelante quieres cambiarlo, pero
usar el cuerpo de alguien para "colocarlo" en un nivel es justo el tipo de
suposición que puede sentirse ofensiva.
