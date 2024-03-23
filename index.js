const express = require("express");

const app = express();

app.use(express.json());

const fluentLogger = require("fluent-logger");
const winston = require("winston");

const config = {
  host: process.env.FLUENTD_HOST,
  port: 24224,
  timeout: 3.0,
  requireAckResponse: true, // Add this option to wait response from Fluentd certainly
};

const fluentTransport = require("fluent-logger").support.winstonTransport();
const fluent = new fluentTransport("mytag", config);

const logger = winston.createLogger({
  transports: [fluent, new winston.transports.Console()],
});

logger.on("flush", () => {
  console.log("flush");
});

logger.on("finish", () => {
  console.log("finish");
  fluent.sender.end("end", {}, () => {});
});

logger.log("info", "this log record is sent to fluent daemon");
logger.info("this log record is sent to fluent daemon");
logger.info("end of log message");
// logger.end();

// Middleware de registro para capturar solicitudes y respuestas
app.use((req, res, next) => {
  logger.info("info", { url: req.originalUrl });
  next();
});

app.get("/", (req, res) => {
  logger.info({ message: "ok!" });

  res.json({ message: "ok" });
});

app.post("/", (req, res) => {
  logger.info({ body: req.body });

  res.json(req.body);
});

// Inicia el servidor
app.listen(3000, () => {
  console.log("Servidor Express escuchando en el puerto 3000");
});
