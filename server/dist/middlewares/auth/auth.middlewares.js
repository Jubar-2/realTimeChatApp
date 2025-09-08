"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const db_1 = __importDefault(require("../../db"));
const ApiResponse_1 = require("../../utils/ApiResponse");
const asyncHandler_1 = __importDefault(require("../../utils/asyncHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
exports.verifyJWT = (0, asyncHandler_1.default)(async (req, res, next) => {
    var _a, _b;
    try {
        // Extract token from cookies or Authorization header
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) ||
            ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
        console.log(req.cookies);
        if (!token) {
            return res.status(400).json(new ApiResponse_1.ApiResponse(400, {}, "Unathorization request"));
        }
        // Verify and decode JWT
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_SECRET_TOKEN);
        // Query the database for the user
        const user = await db_1.default.user.findFirst({
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
            return res.status(400).json(new ApiResponse_1.ApiResponse(400, {}, "invalid access token"));
        }
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse_1.ApiResponse(500, {}, "Internal server error"));
    }
});
