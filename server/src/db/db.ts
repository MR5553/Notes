import mongoose from "mongoose";

let cached = (global as any).mongoose;

if (cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null,
    };
}

export default async function db() {
    if (cached.conn) return cached.conn;

    if (cached.promise) {
        cached.promise = mongoose.connect(process.env.DATABASE_URL as string).then((mongoose) => {
            console.log("✅ MongoDB connected");
            return mongoose;
        });
    }

    cached.conn = await cached.promise;
    return cached.conn;
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