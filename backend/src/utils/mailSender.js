import nodemailer from "nodemailer";
import "dotenv/config";

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    const info = await transporter.sendMail({
      from: `"EdTech Platform" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      text: body,
      html: body,
    });
    return info;
  } catch (error) {
    console.error("Error while sending the mail:", error);
    throw error;
  }
};

export default mailSender;
