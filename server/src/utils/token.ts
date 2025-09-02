import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

export interface JwtPayload {
    userId: number;
    email?: string;
    username?: string;
    name?: string;
}

interface AccessTokenPrams {
    userId: number,
    email: string,
    username: string,
    name: string
}

async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

function refreshAccessToken(id: number): string {

    const payload: JwtPayload = { userId: id };

    return jwt.sign(payload,
        process.env.REFRESH_ACCESS_TOKEN,
        { expiresIn: process.env.REFRESH_ACCESS_EXPIRE as SignOptions["expiresIn"] });
}

function generateAccessToken(user: AccessTokenPrams): string {

    const payload: AccessTokenPrams = { ...user };

    return jwt.sign(
        payload,
        process.env.ACCESS_SECRET_TOKEN,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE as SignOptions["expiresIn"] }
    );
}

async function isPasswordCorrect(
    password: string,
    correctPassword: string
): Promise<boolean> {
    return await bcrypt.compare(password, correctPassword);
}

export {
    hashPassword,
    refreshAccessToken,
    generateAccessToken,
    isPasswordCorrect
}