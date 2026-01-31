import { createTransport, type SendMailOptions } from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";


export const transporter = createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
    debug: true,
    tls: { rejectUnauthorized: false }
});

transporter.verify((error: unknown) => {
    if (error) {
        throw error;
    }
    console.log("Server is ready to exchange mails")
});


transporter.use("compile", hbs({
    viewEngine: {
        extname: ".hbs",
        defaultLayout: false,
    },
    viewPath: path.resolve("src/mails/templates"),
    extName: ".hbs",
}));

export const sendOtp = async (name = "Munna", email = "munna12112003@gmail.com", otp = 123456) => {
    const option: SendMailOptions & { template?: string; context?: any } = {
        from: "Notion Clone <no-reply@yourapp.com>",
        to: email,
        subject: "Verify Your Email",
        template: "verify-email",
        context: {
            name: name,
            otp: otp,
            year: new Date().getFullYear()
        },
    }
    return transporter.sendMail(option)
}