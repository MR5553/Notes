import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { GlobalErrorHandler } from "./middleware/globalErrorHandler";
import { limiter } from "./middleware/limiter.middleware";
import db from "./db/db";
db();


const PORT = Number(process.env.PORT || 5553);
const HOST = process.env.HOST || "0.0.0.0";

const app = express();

app.use(express.json());
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
    origin: [process.env.CLIENT_ORIGIN as string],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use(limiter.global);


import userRoutes from "./routes/user.route";
import workspaceRoute from "./routes/workspace.route";
import pageRoute from "./routes/page.route";
import blockRoute from "./routes/block.route";
import uploadRoute from "./routes/upload.route";


app.use("/api", userRoutes);
app.use("/api", workspaceRoute);
app.use("/api", pageRoute);
app.use("/api", blockRoute);
app.use("/api", uploadRoute)
app.use(GlobalErrorHandler);


app.listen(PORT, HOST, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
    console.log("🛑 Server shutting down gracefully...");
    process.exit(0);
});


export default app;