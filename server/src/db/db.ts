import mongoose from "mongoose";

export default async function db() {
    try {
        const connection = mongoose.connection;

        connection.on("connected", () => {
            console.log("✅ MongoDB connected successfully");
        });

        connection.on("error", (error: Error) => {
            console.error("❌ MongoDB connection error:", error);
            process.exit(1);
        });

        connection.on("disconnected", () => {
            console.log("⚠️ MongoDB disconnected!");
        });

        await mongoose.connect(process.env.DATABASE_URL as string, { dbName: "notes" });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
        process.exit(1);
    }
}

const transform = (_doc: any, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
};

mongoose.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: transform
});

mongoose.set("toObject", {
    virtuals: true,
    versionKey: false,
    transform: transform
});