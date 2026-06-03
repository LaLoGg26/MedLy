// backend/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const enviarCorreoVerificacion = async (correoDestino, codigo) => {
  try {
    const mailOptions = {
      from: `"Equipo MedLy" <${process.env.EMAIL_USER}>`,
      to: correoDestino,
      subject: "Verifica tu cuenta en MedLy 🏥",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E0F7F7; border-radius: 12px;">
                    <h2 style="color: #BE84C7; text-align: center;">¡Bienvenido a MedLy!</h2>
                    <p style="color: #2D3748; font-size: 16px;">Gracias por registrarte. Para completar tu creación de cuenta y asegurar que este correo te pertenece, por favor ingresa el siguiente código de verificación en la aplicación:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #FAFBFC; border: 2px dashed #A9E6E6; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2D3748; border-radius: 8px;">
                            ${codigo}
                        </span>
                    </div>
                    <p style="color: #718096; font-size: 14px; text-align: center;">Si tú no solicitaste este registro, puedes ignorar este correo de forma segura.</p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo de verificación enviado a ${correoDestino}`);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw new Error("No se pudo enviar el correo de verificación");
  }
};
