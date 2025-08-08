import prisma from "@/db";
import { ApiResponse } from "@/utils/ApiResponse";
import asyncHandler from "@/utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


export const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {

        // Extract token from cookies or Authorization header
        const token = req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(500).json(new ApiResponse(500, {}, "Unthorization request"));
        }

        // Verify and decode JWT
        const decodedToken = jwt.verify(token, process.env.ACCESS_SECRET_TOKEN) as User;

        // Query the database for the user
        const user = await prisma.user.findFirst({
            where: {
                userId: decodedToken.userId
            },
            select: {
                userId: true,
                email: true,
                username: true,
                name: true,
            }
        });

        if (!user) {
            return res.status(500).json(new ApiResponse(500, {}, "invalid accass token"));
        }

        req.user = user;

        next();

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
})