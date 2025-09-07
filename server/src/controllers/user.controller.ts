import prisma from "@/db";
import { ApiResponse } from "@/utils/ApiResponse";
import asyncHandler from "@/utils/asyncHandler";
import { hashPassword, generateAccessToken, isPasswordCorrect, refreshAccessToken, JwtPayload } from "@/utils/token";
import { Request, Response } from 'express';
import jwt from "jsonwebtoken";

// Constant for cookie options (could be in a separate config file)
const option = {
    httpOnly: true,
    secure: true,
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

const allUsers = asyncHandler(async (req, res) => {
    try {

        const userId = req.user.userId;

        const users = userId
            ? await prisma.user.findMany({
                where: {
                    NOT: { userId },
                    ConversationParticipant: {
                        some: {
                            conversation: {
                                conversationParticipant: {
                                    some: { userId }
                                }
                            }
                        }
                    }
                },

                select: {
                    avatar: true,
                    email: true,
                    isOnline: true,
                    lastSeen: true,
                    name: true,
                    statusStatusId: true,
                    userId: true,
                    username: true,
                    ConversationParticipant: {
                        where: {
                            conversation: {
                                conversationParticipant: {
                                    some: { userId }
                                }
                            }
                        },
                        include: {
                            conversation: {
                                include: {
                                    lastMessage: true
                                }
                            }
                        }
                    }
                }
            })
            : [];


        return res.status(201).json(new ApiResponse(201, users, "get all conversation"));
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
});

const searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string;

    try {

        const userId = req.user.userId;

        const users = userId
            ? await prisma.user.findMany({
                where: {
                    NOT: { userId },
                    OR: [
                        { username: { contains: search, mode: "insensitive" } },
                        { name: { contains: search, mode: "insensitive" } },
                    ]
                },

                select: {
                    avatar: true,
                    email: true,
                    isOnline: true,
                    lastSeen: true,
                    name: true,
                    statusStatusId: true,
                    userId: true,
                    username: true,
                    ConversationParticipant: {
                        where: {
                            conversation: {
                                conversationParticipant: {
                                    some: { userId }
                                }
                            }
                        },
                        include: {
                            conversation: {
                                include: {
                                    lastMessage: true
                                }
                            }
                        }
                    }
                }
            })
            : [];


        return res.status(201).json(new ApiResponse(201, users, "get all users"));
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }

})

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

const checkAuthorizeUser = asyncHandler(
    async (req: Request, res: Response) => {
        try {
            const { id } = req.body;

            if (req.user.userId === +id) {
                return res.status(201).json(new ApiResponse(201, {}, "User is authorize"));
            }

            return res
                .status(404)
                .json(new ApiResponse(404, {}, "User is not authorize"));
        } catch (error) {
            console.log(error)
            return res
                .status(500)
                .json(new ApiResponse(500, {}, "server error"));
        }
    }
);


const refreshAccessTokenClt = asyncHandler(async (req: Request, res: Response) => {
    const incomingRefreshToken = req?.cookies?.refreshToken || req?.body?.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(401).json(
            new ApiResponse(401, {}, "unauthorized request")
        );
    }

    try {

        const decodedToken: JwtPayload = jwt.verify(incomingRefreshToken, process.env.REFRESH_ACCESS_TOKEN) as JwtPayload;

        // Check if the user exists by email or username
        const user = await prisma.user.findFirst({
            where: {
                userId: decodedToken.userId
            },
            select: {
                userId: true,
                email: true,
                username: true,
                name: true,
                refreshToken: true
            },
        });

        if (!user) {
            return res.status(401).json(
                new ApiResponse(401, {}, "Invalid refresh token")
            );
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            return res.status(401).json(
                new ApiResponse(401, {}, "Refresh token is invalid or expired")
            );
        }

        const userPayload: User = {
            userId: user.userId,
            email: user.email,
            username: user.username,
            name: user.name,
        };

        // Generate tokens
        const accessToken = generateAccessToken(userPayload);
        const refreshToken = refreshAccessToken(user.userId);

        res.status(200)
            .cookie("asscessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(new ApiResponse(200,
                { accessToken, refreshToken },
                "crated new asscessToken and refreshToken")
            );


    } catch (error) {
        return res
            .status(500)
            .json(new ApiResponse(500, {}, "server error"));
    }
})

export {
    userRegister,
    loginUser,
    logOutUser,
    checkAuthorizeUser,
    refreshAccessTokenClt,
    allUsers,
    searchUsers
}