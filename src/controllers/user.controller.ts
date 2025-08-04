import prisma from "@/db";
import { ApiResponse } from "@/utils/ApiResponse";
import asyncHandler from "@/utils/asyncHandler";
import { hashPassword, refreshAccessToken } from "@/utils/token";
import { Request, Response } from 'express';

// request body fields
interface RegisterRequestBody {
    email: string;
    username: string;
    password: string;
    name: string;
}

// Public fields 
interface PublicUser {
    email: string;
    username: string;
    name: string;
}

const userRegister = asyncHandler(async (
    req: Request<{}, {}, RegisterRequestBody>,
    res: Response
) => {

    // Get fields 
    const { email, username, password, name } = req.body;

    try {
        // Check if email or username already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ]
            },
            select: {
                email: true,
                username: true
            }
        });

        if (existingUser) {
            const conflictField = existingUser.email === email ? "Email" : "Username";
            return res.status(409).json(new ApiResponse(409, {}, `${conflictField} already exists`));
        }

        // Hash password securely
        const hashedPassword = await hashPassword(password);

        // Create user and select only public fields
        const newUser: PublicUser = await prisma.user.create({
            data: {
                email,
                username,
                name,
                password: hashedPassword
            },
            select: {
                email: true,
                username: true,
                name: true
            }
        });

        return res.status(201).json(new ApiResponse(201, newUser, "User registered successfully"));
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
});



export { userRegister }