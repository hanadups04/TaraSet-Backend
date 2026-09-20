import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import itemsRouter from "./routes/items.routes";
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/errorHandler";
import helmet from "helmet";
import { issueCsrfToken } from "./middleware/csrf";

dotenv.config();

const app: Application = express();

app.use(cors(
  {
    origin: "http://localhost:3000"
  }
));
app.use(helmet());
app.use(issueCsrfToken);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: 'ok' });
});

app.use("/api/circles", itemsRouter);
app.use("/api/auth", authRoutes);

// 404 for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

export default app;
