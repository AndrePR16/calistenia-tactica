require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { router: authRouter, authMiddleware } = require("./routes/auth");
const purchaseRouter = require("./routes/purchase");
const buildProfileRouter = require("./routes/profile");
const buildRoutinesRouter = require("./routes/routines");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/purchase", purchaseRouter);
app.use("/api", buildProfileRouter(authMiddleware));
app.use("/api/routines", buildRoutinesRouter(authMiddleware));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Calistenia Táctica API escuchando en http://localhost:${PORT}`);
  if (!process.env.SMTP_HOST) {
    console.log(
      "Modo desarrollo: los correos de acceso se guardan en backend/data-store/emails/ en vez de enviarse de verdad."
    );
  }
});
