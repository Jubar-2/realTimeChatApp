import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";

interface JwtPayload {
    _id: string;
    email?: string;
    username?: string;
    name?: string;
}

async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

async function refreshAccessToken(id: string): Promise<string> {

    const payload: JwtPayload = { _id: id };

    return jwt.sign(payload,
        process.env.REFRESH_ACCESS_TOKEN,
        { expiresIn: process.env.REFRESH_ACCESS_EXPIRE as SignOptions["expiresIn"] });
}

async function generateAccessToken(
    id: string,
    email: string,
    username: string,
    name: string): Promise<string> {

    const payload: JwtPayload = { _id: id, email, name, username };

    return jwt.sign(
        payload,
        process.env.ACCESS_SECRET_TOKEN,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRE as SignOptions["expiresIn"] }
    );

}

export { hashPassword, refreshAccessToken, generateAccessToken }