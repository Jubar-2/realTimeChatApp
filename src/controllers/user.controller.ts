import prisma from "@/db";
import { ApiResponse } from "@/utils/ApiResponse";
import asyncHandler from "@/utils/asyncHandler";
import { hashPassword, refreshAccessToken, generateAccessToken, isPasswordCorrect } from "@/utils/token";
import { Request, Response } from 'express';

// Constant for cookie options (could be in a separate config file)
const option = {
    httpOnly: true,
    secure: true
};

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


const loginUser = asyncHandler(
    async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
        const { identifier, password } = req.body;

        // Check if the user exists by email or username
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ email: identifier }, { username: identifier }],
            },
            select: {
                userId: true,
                email: true,
                username: true,
                name: true,
                password: true,
            },
        });

        if (!user) {
            return res
                .status(404)
                .json(new ApiResponse(404, {}, "Email or username not found"));
        }

        // Validate password
        const isPasswordValid = await isPasswordCorrect(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json(new ApiResponse(401, {}, "Invalid credentials"));
        }

        // Prepare token payload
        const userPayload: User = {
            userId: user.userId,
            email: user.email,
            username: user.username,
            name: user.name,
        };

        // Generate tokens
        const accessToken = generateAccessToken(userPayload);
        const refreshToken = refreshAccessToken(user.userId);

        // Update refresh token in DB
        await prisma.user.update({
            where: { userId: user.userId },
            data: { refreshToken },
        });

        // Send tokens as HttpOnly cookies and user data in response
        res
            .status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(
                new ApiResponse(200, { user: userPayload, accessToken, refreshToken }, "Login successful")
            );
    }
);


const logOutUser = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json(
                    new ApiResponse(401, {}, "Unauthorized: user not found in request")
                );
            }

            // Remove refresh token from database
            await prisma.user.update({
                where: { userId },
                data: { refreshToken: null },
            });

            // Clear tokens from cookies
            res
                .status(200)
                .clearCookie("asscessToken", option)
                .clearCookie("refreshToken", option)
                .json(
                    new ApiResponse(200, {}, "User logged out successfully")
                );
        } catch (error) {
            console.error("Logout error:", error);
            return res
                .status(500)
                .json(new ApiResponse(500, {}, "Internal server error"));
        }
    }
);

export { userRegister, loginUser, logOutUser }