import { sendEmail } from '../mail/MailService.js';

import path from 'path';
import fs from 'fs';
import prisma from '../../prisma/PrismaClient.js';

export const requestSign = async (req, res) => {

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await prisma.user.findFirst({
        where: { email },
        select: {
            name: true,
        }
    });
    
    const data = {
        sign_name_requester: user ? user.name : "Rodrigo",
        guest_name: "Pablo",
        document_name: "documento importante 3049",
        document_link: "https://www.google.com",
        profile_image: "https://adamoservices.co/img/template_assets/no_picture_sign.png"
    };

    const requestSignTemplate = path.join(process.cwd(), 'compiled', 'request_sign.html');
            let requestSignHTML = fs.readFileSync(requestSignTemplate, 'utf8');
            requestSignHTML = requestSignHTML
                .replace(/\{\{sign_name_requester\}\}/g, data.sign_name_requester)
                .replace('{{guest_name}}', data.guest_name)
                .replace('{{document_name}}', data.document_name)
                .replace(/\{\{document_link\}\}/g, data.document_link)
                .replace('{{profile_image}}', data.profile_image)

    const mailOptions = {
        from: process.env.MAIL_SENDER,
        to: email,
        subject: 'Solicitud de firma',
        text: 'Has sido invitado a firmar un documento.',
        html: requestSignHTML
    };

    try {
        await sendEmail(mailOptions);
    } catch (error) {
        return res.status(500).json({ msg: 'Error sending email', error: error.message });
    }

    res.status(200).json({ msg: 'Request sign email sent successfully'});
}

export const declinedDoc = async (req, res) => {

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ msg: 'Email is required' });
    }

    const user = await prisma.user.findFirst({
        where: { email },
        select: {
            name: true,
        }
    });

    const data = {
        signer_name: user ? user.name : "Rodrigo",
        document_name: "documento importante 3049",
        signer_comment: "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        signer_profile_picture: "https://adamoservices.co/img/template_assets/Photo.png",
        date: "23/10/2025",
        document_link: "https://www.google.com"
    }

    const declineDocTemplate = path.join(process.cwd(), 'compiled', 'declined_doc.html');
            let declineDocHTML = fs.readFileSync(declineDocTemplate, 'utf8');
            declineDocHTML = declineDocHTML
                .replace(/\{\{signer_name\}\}/g, data.signer_name)
                .replace('{{document_name}}', "documento importante 3049")
                .replace('{{signer_comment}}', "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua")
                .replace('{{date}}', "23/10/2025")
                .replace(/\{\{document_link\}\}/g, "https://www.google.com")
                .replace('{{signer_profile_picture}}', data.signer_profile_picture)
    
    const mailOptions = {
        from: process.env.MAIL_SENDER,
        to: email,
        subject: 'Documento rechazado',
        text: 'Han rechazado firmar tu documento.',
        html: declineDocHTML
    };

    try {
        await sendEmail(mailOptions);
    } catch (error) {
        return res.status(500).json({ msg: 'Error sending email', error: error.message });
    }

    res.status(200).json({ msg: 'Declined document email sent successfully'});
}

export const completedDoc = async (req, res) => {
    
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ msg: 'Email is required' });
    }

    const data = {
        guest_name: "Pablo",
        document_name: "documento importante 3049",
        document_link: "https://www.google.com"
    }

    const completedDocTemplate = path.join(process.cwd(), 'compiled', 'completed_doc.html');
            let completedDocHMTL = fs.readFileSync(completedDocTemplate, 'utf8');
            completedDocHMTL = completedDocHMTL
                .replace('{{guest_name}}', data.guest_name)
                .replace('{{document_name}}', data.document_name)
                .replace(/\{\{document_link\}\}/g, "https://www.google.com")
    
    const mailOptions = {
        from: process.env.MAIL_SENDER,
        to: email,
        subject: 'Documento Completado',
        text: 'Tu documento ha sido firmado y completado.',
        html: completedDocHMTL
    };

    try {
        await sendEmail(mailOptions);
    } catch (error) {
        return res.status(500).json({ msg: 'Error sending email' });
    }

    res.status(201).json({ msg: 'Completed document email sent successfully' });

}
