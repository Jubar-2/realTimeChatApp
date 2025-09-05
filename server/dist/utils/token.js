"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.refreshAccessToken = refreshAccessToken;
exports.generateAccessToken = generateAccessToken;
exports.isPasswordCorrect = isPasswordCorrect;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
async function hashPassword(password) {
    return await bcryptjs_1.default.hash(password, 10);
}
function refreshAccessToken(id) {
    const payload = { userId: id };
    return jsonwebtoken_1.default.sign(payload, process.env.REFRESH_ACCESS_TOKEN, { expiresIn: process.env.REFRESH_ACCESS_EXPIRE });
}
function generateAccessToken(user) {
    const payload = Object.assign({}, user);
    return jsonwebtoken_1.default.sign(payload, process.env.ACCESS_SECRET_TOKEN, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
}
async function isPasswordCorrect(password, correctPassword) {
    return await bcryptjs_1.default.compare(password, correctPassword);
}
