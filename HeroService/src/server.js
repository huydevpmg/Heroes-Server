import { json } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import  express from "express";
import  dotenv from "dotenv";
import http from "http";
import connectDB from "./db/mongo.js";
import heroRouter from "./routes/hero.route.js";
import tagRoute from "./routes/tag.route.js";
dotenv.config();

const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:43879"], 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  })
);


app.use("/api/heroes", heroRouter);
app.use("/api/tags", tagRoute)
server.listen(PORT, async () => {
  console.log("server is running on PORT:" + PORT);
  await connectDB();
});
