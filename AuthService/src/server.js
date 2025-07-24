import cookieParser from "cookie-parser";
import cors from "cors";
import  express from "express";
import http from "http";
import connectDB from "./db/mongo.js";
import authRoute from "./routes/auth.route.js";
import profileRoute from "./routes/profile.route.js";
import { config } from "./config/index.js";
import { connectRedis } from "./lib/redis/redis.js";

const PORT = config.port || 4000;
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:43879" ], 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
);


app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);

const startServer = async () => {
  try {
    await connectRedis();
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => {
      console.log("server is running on PORT:" + PORT);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();