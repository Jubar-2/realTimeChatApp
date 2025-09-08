"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsers = exports.allUsers = exports.refreshAccessTokenClt = exports.checkAuthorizeUser = exports.logOutUser = exports.loginUser = exports.userRegister = void 0;
const db_1 = __importDefault(require("../db"));
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const token_1 = require("../utils/token");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Constant for cookie options (could be in a separate config file)
const option = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    // domain: ".vercel.app",
    path: "/"
};
const userRegister = (0, asyncHandler_1.default)(async (req, res) => {
    // Get fields 
    const { email, username, password, name } = req.body;
    try {
        // Check if email or username already exists
        const existingUser = await db_1.default.user.findFirst({
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
            return res.status(409).json(new ApiResponse_1.ApiResponse(409, {}, `${conflictField} already exists`));
        }
        // Hash password securely
        const hashedPassword = await (0, token_1.hashPassword)(password);
        // Create user and select only public fields
        const newUser = await db_1.default.user.create({
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
        return res.status(201).json(new ApiResponse_1.ApiResponse(201, newUser, "User registered successfully"));
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse_1.ApiResponse(500, {}, "Internal server error"));
    }
});
exports.userRegister = userRegister;
const allUsers = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const userId = req.user.userId;
        const users = userId
            ? await db_1.default.user.findMany({
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
        return res.status(201).json(new ApiResponse_1.ApiResponse(201, users, "get all conversation"));
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse_1.ApiResponse(500, {}, "Internal server error"));
    }
});
exports.allUsers = allUsers;
const searchUsers = (0, asyncHandler_1.default)(async (req, res) => {
    const search = req.query.search;
    try {
        const userId = req.user.userId;
        const users = userId
            ? await db_1.default.user.findMany({
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
        return res.status(201).json(new ApiResponse_1.ApiResponse(201, users, "get all users"));
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse_1.ApiResponse(500, {}, "Internal server error"));
    }
});
exports.searchUsers = searchUsers;
const loginUser = (0, asyncHandler_1.default)(async (req, res) => {
    const { identifier, password } = req.body;
    // Check if the user exists by email or username
    const user = await db_1.default.user.findFirst({
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
            .json(new ApiResponse_1.ApiResponse(404, {}, "Email or username not found"));
    }
    // Validate password
    const isPasswordValid = await (0, token_1.isPasswordCorrect)(password, user.password);
    if (!isPasswordValid) {
        return res
            .status(401)
            .json(new ApiResponse_1.ApiResponse(401, {}, "Invalid credentials"));
    }
    // Prepare token payload
    const userPayload = {
        userId: user.userId,
        email: user.email,
        username: user.username,
        name: user.name,
    };
    // Generate tokens
    const accessToken = (0, token_1.generateAccessToken)(userPayload);
    const refreshToken = (0, token_1.refreshAccessToken)(user.userId);
    // Update refresh token in DB
    await db_1.default.user.update({
        where: { userId: user.userId },
        data: { refreshToken },
    });
    // Send tokens as HttpOnly cookies and user data in response
    res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(new ApiResponse_1.ApiResponse(200, { user: userPayload, accessToken, refreshToken }, "Login successful"));
});
exports.loginUser = loginUser;
const logOutUser = (0, asyncHandler_1.default)(async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json(new ApiResponse_1.ApiResponse(401, {}, "Unauthorized: user not found in request"));
        }
        // Remove refresh token from database
        await db_1.default.user.update({
            where: { userId },
            data: { refreshToken: null },
        });
        // Clear tokens from cookies
        res
            .status(200)
            .clearCookie("asscessToken", option)
            .clearCookie("refreshToken", option)
            .json(new ApiResponse_1.ApiResponse(200, {}, "User logged out successfully"));
    }
    catch (error) {
        console.error("Logout error:", error);
        return res
            .status(500)
            .json(new ApiResponse_1.ApiResponse(500, {}, "Internal server error"));
    }
});
exports.logOutUser = logOutUser;
const checkAuthorizeUser = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const { id } = req.body;
        if (req.user.userId === +id) {
            return res.status(201).json(new ApiResponse_1.ApiResponse(201, {}, "User is authorize"));
        }
        return res
            .status(404)
            .json(new ApiResponse_1.ApiResponse(404, {}, "User is not authorize"));
    }
    catch (error) {
        console.log(error);
        return res
            .status(500)
            .json(new ApiResponse_1.ApiResponse(500, {}, "server error"));
    }
});
exports.checkAuthorizeUser = checkAuthorizeUser;
const refreshAccessTokenClt = (0, asyncHandler_1.default)(async (req, res) => {
    var _a, _b;
    const incomingRefreshToken = ((_a = req === null || req === void 0 ? void 0 : req.cookies) === null || _a === void 0 ? void 0 : _a.refreshToken) || ((_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.refreshToken);
    if (!incomingRefreshToken) {
        return res.status(401).json(new ApiResponse_1.ApiResponse(401, {}, "unauthorized request"));
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(incomingRefreshToken, process.env.REFRESH_ACCESS_TOKEN);
        // Check if the user exists by email or username
        const user = await db_1.default.user.findFirst({
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
            return res.status(401).json(new ApiResponse_1.ApiResponse(401, {}, "Invalid refresh token"));
        }
        if (incomingRefreshToken !== (user === null || user === void 0 ? void 0 : user.refreshToken)) {
            return res.status(401).json(new ApiResponse_1.ApiResponse(401, {}, "Refresh token is invalid or expired"));
        }
        const userPayload = {
            userId: user.userId,
            email: user.email,
            username: user.username,
            name: user.name,
        };
        // Generate tokens
        const accessToken = (0, token_1.generateAccessToken)(userPayload);
        const refreshToken = (0, token_1.refreshAccessToken)(user.userId);
        res.status(200)
            .cookie("asscessToken", accessToken, option)
            .cookie("refreshToken", refreshToken, option)
            .json(new ApiResponse_1.ApiResponse(200, { accessToken, refreshToken }, "crated new asscessToken and refreshToken"));
    }
    catch (error) {
        return res
            .status(500)
            .json(new ApiResponse_1.ApiResponse(500, {}, "server error"));
    }
});
exports.refreshAccessTokenClt = refreshAccessTokenClt;
