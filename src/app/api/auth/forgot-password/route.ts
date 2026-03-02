import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return success even if not found to prevent email enumeration
            return NextResponse.json({ success: true, message: "If the email is registered, a reset link has been sent." });
        }

        const token = randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour token

        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expires,
            },
        });

        // Determine the base URL for the reset link
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

        // ALWAYS print the link to the console for easy local development / testing without SMTP configured
        console.log(`\n\n=== PASSWORD RESET LINK GENERATED ===\nFor User: ${email}\nLink: ${resetLink}\n=====================================\n\n`);

        // If SMTP credentials exist, try to send the email
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.SMTP_FROM || `"Mindset System" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Password Reset Request",
                html: `
                    <p>Hello ${user.name},</p>
                    <p>Someone requested a password reset for your account. If this was you, please click the link below to set a new password:</p>
                    <p><a href="${resetLink}">${resetLink}</a></p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <br/>
                    <p>Thanks,</p>
                    <p>Mindset Team</p>
                `,
            });
        }

        return NextResponse.json({ success: true, message: "If the email is registered, a reset link has been sent." });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 });
    }
}
