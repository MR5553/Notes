import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import "./services/passport";
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
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());
app.use(express.static("public"));
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", 1);
app.use(limiter.global);


import userRoutes from "./routes/user.route";
import pageRoute from "./routes/page.route";
import blockRoute from "./routes/block.route";
import oauthRoute from "./routes/oauth.route"


app.use("/api", userRoutes);
app.use("/api", pageRoute);
app.use("/api", blockRoute);
app.use("/api", oauthRoute);
app.use(GlobalErrorHandler);


app.listen(PORT, HOST, () => {
    console.log(`server is running at http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
    console.log("🛑 Server shutting down gracefully...");
    process.exit(0);
});


export default app;