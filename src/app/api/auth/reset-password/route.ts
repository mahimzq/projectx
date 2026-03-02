import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
        }

        // Find the valid, unexpired token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
        });

        if (!resetToken || resetToken.expires < new Date()) {
            return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 });
        }

        // Find the associated user
        const user = await prisma.user.findUnique({
            where: { email: resetToken.email },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Update the user's password in the database
        // In a real app we'd hash this, but the current implementation uses plain text
        await prisma.user.update({
            where: { id: user.id },
            data: { password: newPassword },
        });

        // Delete the token so it cannot be reused
        await prisma.passwordResetToken.delete({
            where: { id: resetToken.id },
        });

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
    }
}
