"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAsRead = exports.getMessage = exports.getAllConversation = exports.sendMessage = void 0;
const db_1 = __importDefault(require("../db"));
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const Cloudinary_1 = require("../utils/Cloudinary");
const prisma_1 = require("../../generated/prisma");
const sendMessage = (0, asyncHandler_1.default)(async (req, res) => {
    var _a;
    try {
        const { senderId, receiverId, content, messageStatus } = req.body;
        const files = req.files;
        const participates = [+senderId, +receiverId].sort();
        let conversation = await db_1.default.conversation.findFirst({
            where: {
                conversationParticipant: {
                    every: {
                        userId: {
                            in: participates,
                        },
                    },
                    some: {
                        userId: {
                            in: participates,
                        },
                    },
                }
            }
        });
        if (!conversation) {
            conversation = await db_1.default.conversation.create({
                data: {
                    conversationParticipant: {
                        create: [
                            { userId: participates[0] },
                            { userId: participates[1] },
                        ],
                    },
                }
            });
        }
        let imageOrVideoUrl = null;
        let contentType = prisma_1.ContentType.TEXT;
        if (files === null || files === void 0 ? void 0 : files.midea) {
            const filePath = (_a = files === null || files === void 0 ? void 0 : files.midea[0]) === null || _a === void 0 ? void 0 : _a.path;
            const uploadFile = await (0, Cloudinary_1.uploadOnCloudinary)(filePath);
            if (!(uploadFile === null || uploadFile === void 0 ? void 0 : uploadFile.secure_url)) {
                return res.status(400).json(new ApiResponse_1.ApiResponse(400, {}, "file error"));
            }
            imageOrVideoUrl = uploadFile.secure_url;
            if (files.midea[0].mimetype.startsWith("video")) {
                contentType = prisma_1.ContentType.VIDEO;
            }
            else if (files.midea[0].mimetype.startsWith("image")) {
                contentType = prisma_1.ContentType.IMAGE;
            }
            else {
                return res.status(400).json(new ApiResponse_1.ApiResponse(400, {}, "unexpected file"));
            }
        }
        else if (content === null || content === void 0 ? void 0 : content.trim) {
            contentType = prisma_1.ContentType.TEXT;
        }
        else {
            return res.status(400).json(new ApiResponse_1.ApiResponse(400, {}, "unexpected content type"));
        }
        const sendMessage = await db_1.default.message.create({
            data: {
                userUserId: +senderId,
                content: content,
                conversationId: conversation.conversationId,
                imageOrVideoUrl: imageOrVideoUrl,
                contentType,
                receiverUser: +receiverId,
                messageStatus
            }
        });
        await db_1.default.conversation.update({
            where: { conversationId: conversation.conversationId },
            data: {
                messageMessageId: sendMessage.MessageId,
                unreadCount: conversation.unreadCount + 1
            }
        });
        if (req.io && req.socketUserMap) {
            const receiverSocketId = req.socketUserMap.get(+receiverId);
            if (receiverSocketId) {
                req.io.to(receiverSocketId).emit("receive_message", sendMessage);
                db_1.default.message.update({
                    where: {
                        MessageId: sendMessage.MessageId
                    },
                    data: {
                        messageStatus: "delivered"
                    }
                });
            }
        }
        return res.status(201).json(new ApiResponse_1.ApiResponse(201, sendMessage, "Send message successfully"));
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse_1.ApiResponse(500, {}, "Internal server error"));
    }
});
exports.sendMessage = sendMessage;
const getAllConversation = (0, asyncHandler_1.default)(async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversation = userId
            ? await db_1.default.conversation.findMany({
                where: {
                    conversationParticipant: {
                        some: {
                            userId: { equals: userId }
                        }
                    }
                },
                include: {
                    lastMessage: {
                        include: {
                            sender: {
                                select: {
                                    userId: true,
                                    name: true,
                                    username: true,
                                }
                            },
                            receiver: {
                                select: {
                                    userId: true,
                                    name: true,
                                    username: true,
                                }
                            },
                        },
                    },
                    conversationParticipant: true,
                },
            }) : [];
        return res.status(201).json(new ApiResponse_1.ApiResponse(201, conversation, "get all conversation"));
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse_1.ApiResponse(500, {}, "Internal server error"));
    }
});
exports.getAllConversation = getAllConversation;
const getMessage = (0, asyncHandler_1.default)(async (req, res) => {
    const { conversationId } = req.params;
    try {
        const userId = req.user.userId;
        const conversation = userId
            ? await db_1.default.conversation.findFirst({
                where: {
                    conversationParticipant: {
                        some: {
                            userId: { equals: userId }
                        }
                    },
                    conversationId: +conversationId
                }
            }) : null;
        if (!conversation) {
            return res.status(500).json(new ApiResponse_1.ApiResponse(400, {}, "Conversation not found"));
        }
        const message = await db_1.default.message.findMany({
            where: {
                conversationId: { equals: +conversationId }
            },
            include: {
                sender: {
                    select: {
                        userId: true,
                        name: true,
                        username: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        userId: true,
                        name: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });
        await db_1.default.message.updateMany({
            where: {
                conversation: {
                    some: {
                        conversationId: { equals: +conversationId }
                    }
                },
                receiver: {
                    userId
                },
                OR: [
                    { messageStatus: "send" },
                    { messageStatus: "delivered" }
                ]
            },
            data: {
                messageStatus: "read"
            }
        });
        await db_1.default.conversation.update({
            where: {
                conversationParticipant: {
                    some: {
                        userId: { equals: userId }
                    }
                },
                conversationId: +conversationId
            },
            data: {
                unreadCount: 0
            }
        });
        return res.status(201).json(new ApiResponse_1.ApiResponse(201, message, "get all massage in this conversation"));
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse_1.ApiResponse(500, {}, "Server error"));
    }
});
exports.getMessage = getMessage;
const makeAsRead = (0, asyncHandler_1.default)(async (req, res) => {
    const { messageIds } = req.body;
    try {
        const userId = req.user.userId;
        const messages = await db_1.default.message.findMany({
            where: {
                MessageId: {
                    in: messageIds
                },
                receiverUser: userId,
            }
        });
        await db_1.default.message.updateMany({
            where: {
                MessageId: {
                    in: messageIds
                },
                receiverUser: userId,
            },
            data: {
                messageStatus: "read"
            }
        });
        if (req.io && req.socketUserMap) {
            messages.forEach(message => {
                var _a;
                const senderSocketId = req.socketUserMap.get(message.receiverUser);
                if (senderSocketId) {
                    db_1.default.message.update({
                        where: {
                            MessageId: message.MessageId
                        },
                        data: {
                            messageStatus: "read"
                        }
                    });
                    (_a = req.io) === null || _a === void 0 ? void 0 : _a.to(senderSocketId).emit("message_read", messages);
                }
            });
        }
        return res.status(201).json(new ApiResponse_1.ApiResponse(201, messages, "make read all massage in this user"));
    }
    catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse_1.ApiResponse(500, {}, "Server error"));
    }
});
exports.makeAsRead = makeAsRead;
