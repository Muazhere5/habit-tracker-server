import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import habitsRoute from "./routes/habits.js";
import { authOptional } from "./middleware/authOptional.js";

const app = express();
app.use(express.json());


const origins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || origins.length === 0 || origins.includes(origin)),
  credentials: true
}));


app.get("/", (_req, res) => res.send("Habit Tracker API OK"));


app.use(authOptional);


app.use("/api/habits", habitsRoute);


const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "habitdb";

connectDB(uri, dbName).then(() => {
  app.listen(port, () => console.log(`✅ Server listening on :${port}`));
});
