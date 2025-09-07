"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatus = void 0;
const db_1 = __importDefault(require("../db"));
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const prisma_1 = require("../../generated/prisma");
const Cloudinary_1 = require("../utils/Cloudinary");
const createStatus = (0, asyncHandler_1.default)(async (req, res) => {
    var _a;
    try {
        const { content } = req.body;
        const senderId = req.user.userId;
        const files = req.files;
        let imageOrVideoUrl = null;
        let setContentType = prisma_1.ContentType.TEXT;
        if (files.midea) {
            const filePath = (_a = files === null || files === void 0 ? void 0 : files.midea[0]) === null || _a === void 0 ? void 0 : _a.path;
            const uploadFile = await (0, Cloudinary_1.uploadOnCloudinary)(filePath);
            if (!(uploadFile === null || uploadFile === void 0 ? void 0 : uploadFile.secure_url)) {
                return res.status(400).json(new ApiResponse_1.ApiResponse(400, {}, "file error"));
            }
            imageOrVideoUrl = uploadFile.secure_url;
            if (files.midea[0].mimetype.startsWith("video")) {
                setContentType = prisma_1.ContentType.VIDEO;
            }
            else if (files.midea[0].mimetype.startsWith("image")) {
                setContentType = prisma_1.ContentType.IMAGE;
            }
            else {
                return res.status(400).json(new ApiResponse_1.ApiResponse(400, {}, "unexpected file"));
            }
        }
        else if (content === null || content === void 0 ? void 0 : content.trim) {
            setContentType = prisma_1.ContentType.TEXT;
        }
        else {
            return res.status(400).json(new ApiResponse_1.ApiResponse(400, {}, "unexpected content type"));
        }
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const sendMessage = await db_1.default.status.create({
            data: {
                userId: +senderId,
                content: imageOrVideoUrl || content,
                contentType: setContentType,
                expiresAt
            }
        });
        return res.status(201).json(new ApiResponse_1.ApiResponse(201, sendMessage, "Send message successfully"));
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse_1.ApiResponse(500, {}, "Internal server error"));
    }
});
exports.createStatus = createStatus;
