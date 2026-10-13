const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const { attachChatSocket } = require("./realtime/chatSocket");

dotenv.config();

const app = express();

const server = http.createServer(app);

// Support comma-separated origins: e.g. "https://chugli-rust.vercel.app,http://localhost:8080"
const rawOrigin = process.env.CORS_ORIGIN || "*";
const corsOrigin =
  rawOrigin === "*"
    ? "*"
    : rawOrigin.split(",").map((o) => o.trim().replace(/\/+$/, ""));

const corsOptions = {
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io);

app.use(express.json());

app.use(cors(corsOptions));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);

const PORT = process.env.PORT || 5000;

// Realtime chat (JWT-authenticated, persisted to MongoDB).
attachChatSocket(io);

(async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
