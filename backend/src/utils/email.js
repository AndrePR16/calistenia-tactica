// Envío de credenciales por correo (US-27).
//
// En desarrollo (sin SMTP_HOST configurado) NO se envía correo real: se
// guarda como archivo de texto en data-store/emails/ para que puedas "leerlo"
// como si fueras el usuario, sin depender de una cuenta SMTP real todavía.
// Para producción, solo hay que rellenar SMTP_HOST/USER/PASS en el .env con
// un proveedor real (SendGrid, Mailgun, Resend, tu propio servidor, etc.) y
// este mismo código empieza a mandar correos reales sin tocar nada más.
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const DEV_OUTBOX = path.join(__dirname, "..", "..", "data-store", "emails");

function isDevMode() {
  return !process.env.SMTP_HOST;
}

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

async function sendAccessEmail({ to, username, password }) {
  const appUrl = process.env.APP_URL || "http://localhost:5173";
  const subject = "Tus accesos a Calistenia Táctica";
  const text = [
    `Tu pago fue confirmado. Aquí están tus accesos:`,
    ``,
    `Usuario: ${username}`,
    `Contraseña: ${password}`,
    ``,
    `Ingresa aquí: ${appUrl}/login`,
    ``,
    `Te recomendamos cambiar la contraseña apenas ingreses.`,
  ].join("\n");

  if (isDevMode()) {
    fs.mkdirSync(DEV_OUTBOX, { recursive: true });
    const fileName = `${Date.now()}_${to.replace(/[^a-z0-9@.]/gi, "_")}.txt`;
    const filePath = path.join(DEV_OUTBOX, fileName);
    fs.writeFileSync(filePath, `Para: ${to}\nAsunto: ${subject}\n\n${text}\n`);
    console.log(`[email:dev] Correo simulado guardado en ${filePath}`);
    return { sent: false, devPreviewPath: filePath };
  }

  const transport = getTransport();
  await transport.sendMail({
    from: process.env.EMAIL_FROM || "no-reply@calistenia-tactica.com",
    to,
    subject,
    text,
  });
  return { sent: true };
}

module.exports = { sendAccessEmail, isDevMode };
