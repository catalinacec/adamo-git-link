import { sendEmail } from '../mail/MailService.js';
import prisma from '../../prisma/PrismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';



export const register = async (req, res) => {
    const {name, email, profilePicture} = req.body;

    if (!name || !email) {
        return res.status(400).json({ msg: 'All the fields are required' });
    }

    try {
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Generate a temporary and ramdom password and hash it
        const tempPassword = crypto.randomBytes(16).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const welcomeTemplate = path.join(process.cwd(), 'compiled', 'welcome.html');
        let welcomeHTML = fs.readFileSync(welcomeTemplate, 'utf8');
        welcomeHTML = welcomeHTML
            .replace('{{name}}', name)
            .replace('{{email}}', email)
            .replace('{{password}}', tempPassword);

        // Send verification email
        const mailOptions = {
            from: process.env.MAIL_SENDER,
            to: email,
            subject: 'Bienvenido a Adamo Services',
            text: 'Esta es una contraseña temporal, actualiza tu contraseña una vez inicies sesión.',
            html: welcomeHTML
        };

        try {
            await sendEmail(mailOptions);
        } catch (error) {
            return res.status(500).json({ msg: 'Error sending email' });
        }

        await prisma.user.create({
            data: {
                name,
                email,
                profilePicture: profilePicture || 'https://adamoservices.co/img/template_assets/no_picture_sign.png',
                password: hashedPassword,
                isPassTemporary: true // Set the isPassTemporary flag to true
            }
        });
        
        res.status(201).json({ msg: 'User registered successfully. Please check your email to verify your account.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}


export const changePassword = async (req, res) => {
    const { newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
        return res.status(400).json({ message: 'Both password fields are required' });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // Extract user ID from the token
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is required' });
        }

        const decoded = jwt.verify(token, process.env.SECRET);
        const userId = decoded.id;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
                isPassTemporary: false
            }
        });

        res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ msg: 'All the fields are required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET, {
            expiresIn: '5m'
        });

        res.status(200).json({ msg: 'Login successful', token, isPassTemporary: user.isPassTemporary });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

export const resetPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ msg: 'Email is required' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        const resetCode = Math.floor(10000 + Math.random() * 90000).toString();
        const hashedCode = await bcrypt.hash(resetCode, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { resetTokenCode: hashedCode }
        });

        const restore_pass = path.join(process.cwd(), 'compiled', 'restore_pass.html');
        let restoreHTML = fs.readFileSync(restore_pass, 'utf8');
        restoreHTML = restoreHTML.replace('{{security_code}}', resetCode);

        const mailOptions = {
            from: process.env.MAIL_SENDER,
            to: user.email,
            subject: 'Reset Password',
            html: restoreHTML
        };

        await sendEmail(mailOptions);

        res.status(200).json({ msg: 'Reset password email sent successfully' });
    } catch (error) {
        console.error('Error sending reset password email:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}

export const setNewPassword = async (req, res) => {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
        return res.status(400).json({ msg: 'All fields are required' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.resetTokenCode) {
            return res.status(400).json({ msg: 'Invalid or expired reset code' });
        }

        const isCodeValid = await bcrypt.compare(resetCode, user.resetTokenCode);
        if (!isCodeValid) {
            return res.status(400).json({ msg: 'Invalid or expired reset code' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetTokenCode: null,
                isPassTemporary: false
            }
        });

        res.status(200).json({ msg: 'Password updated successfully' });
    } catch (error) {
        console.error('Error setting new password:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
};

export const logOut = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ msg: 'Token is required' });
    }

    try {
        // Add a blacklist to invalidate the token when logging out
        res.status(200).json({ msg: 'Logged out successfully' });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
}