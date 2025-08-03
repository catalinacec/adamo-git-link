import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../utils/MailLogger.js';

dotenv.config();

// Creamos el transporter para enviar correos
const transporter = nodemailer.createTransport({
    host: 'in-v3.mailjet.com',
    port: 587,
    auth: {
        user: process.env.MAILJET_API_KEY,
        pass: process.env.MAILJET_API_SECRET
    }
});

export const sendEmail = async (mailOptions) => {
    try {
        const response = await transporter.sendMail(mailOptions);
        return response;
    } catch (error) {
        logger.logMailError(error, mailOptions);
        throw new Error('Failed to send email');
    }
};
