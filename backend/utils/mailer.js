// backend/utils/mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
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

export const enviarCredencialesDoctor = async (
  correoPersonal,
  correoInstitucional,
  passwordTemporal,
  nombreDoctor,
) => {
  try {
    const mailOptions = {
      from: `"Administración MedLy" <${process.env.EMAIL_USER}>`,
      to: correoPersonal,
      subject: "¡Bienvenido al Equipo Médico de MedLy! 🏥",
      html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #2D3748; border-radius: 12px; background-color: #F8FAFC;">
                    <h2 style="color: #2D3748; text-align: center;">Bienvenido(a), Dr(a). ${nombreDoctor}</h2>
                    <p style="color: #4A5568; font-size: 16px;">Nos complace informarte que tu perfil profesional ha sido dado de alta exitosamente en la plataforma MedLy.</p>
                    <p style="color: #4A5568; font-size: 16px;">A continuación, te proporcionamos tus credenciales de acceso oficiales:</p>
                    
                    <div style="background-color: #FFFFFF; border-left: 4px solid #BE84C7; padding: 15px; margin: 20px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                        <p style="margin: 5px 0;"><strong>Correo Institucional:</strong> <span style="color: #2B6CB0;">${correoInstitucional}</span></p>
                        <p style="margin: 5px 0;"><strong>Contraseña (ID Médico):</strong> <span style="color: #E53E3E; letter-spacing: 1px;">${passwordTemporal}</span></p>
                    </div>

                    <p style="color: #718096; font-size: 14px; text-align: center; margin-top: 30px;">
                        Por seguridad, te recomendamos cambiar tu contraseña una vez que inicies sesión por primera vez.<br>
                        Este es un mensaje automático generado por el panel de administración de MedLy.
                    </p>
                </div>
            `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Credenciales enviadas al correo personal: ${correoPersonal}`);
  } catch (error) {
    console.error("Error al enviar correo al doctor:", error);
    throw new Error("No se pudo enviar el correo con las credenciales");
  }
};

// Añadir al final de backend/utils/mailer.js

export const enviarCorreoConfirmacionCita = async (
  correoDestino,
  nombrePaciente,
  nombreDoctor,
  fecha,
  hora,
) => {
  try {
    const mailOptions = {
      from: `"Equipo MedLy" <${process.env.EMAIL_USER}>`,
      to: correoDestino,
      subject: "Confirmación de tu Cita Médica 🏥",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E0F7F7; border-radius: 12px; background-color: #FFFFFF;">
            <h2 style="color: #BE84C7; text-align: center;">¡Cita Confirmada!</h2>
            <p style="color: #2D3748; font-size: 16px;">Hola <strong>${nombrePaciente}</strong>,</p>
            <p style="color: #2D3748; font-size: 16px;">Tu consulta general ha sido agendada exitosamente mediante nuestro motor inteligente. Aquí tienes los detalles:</p>
            
            <div style="background-color: #FAFBFC; border-left: 4px solid #BE84C7; padding: 15px; margin: 20px 0; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <p style="margin: 5px 0; color: #2D3748;"><strong>📅 Fecha:</strong> ${fecha}</p>
                <p style="margin: 5px 0; color: #2D3748;"><strong>⏰ Hora:</strong> ${hora} hrs</p>
                <p style="margin: 5px 0; color: #2D3748;"><strong>👨‍⚕️ Médico Asignado:</strong> Dr(a). ${nombreDoctor}</p>
            </div>

            <p style="color: #718096; font-size: 14px; text-align: center; margin-top: 30px;">
                Te sugerimos llegar 15 minutos antes de la hora indicada.<br>
                Las cancelaciones solo se realizan mediante la recepción de la clínica.
            </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo de confirmación de cita enviado a ${correoDestino}`);
  } catch (error) {
    console.error("Error al enviar el correo de confirmación de cita:", error);
  }
};
