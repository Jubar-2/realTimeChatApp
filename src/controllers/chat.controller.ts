import prisma from "@/db";
import { ApiResponse } from "@/utils/ApiResponse";
import asyncHandler from "@/utils/asyncHandler";
import { uploadOnCloudinary } from "@/utils/Cloudinary";
import { ContentType } from "../../generated/prisma";

const sendMessage = asyncHandler(async (req, res) => {
    try {
        const { senderId, receiverId, content, messageStatus } = req.body;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        const participates = [+senderId, +receiverId].sort();

        let conversation = await prisma.conversation.findFirst({
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
            conversation = await prisma.conversation.create({
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

        let contentType: ContentType = ContentType.TEXT;

        if (files.midea) {

            const filePath = files?.midea[0]?.path;

            const uploadFile = await uploadOnCloudinary(filePath);

            if (!uploadFile?.secure_url) {
                return res.status(400).json(new ApiResponse(400, {}, "file error"));
            }

            imageOrVideoUrl = uploadFile.secure_url;

            if (files.midea[0].mimetype.startsWith("video")) {
                contentType = ContentType.VIDEO;
            } else if (files.midea[0].mimetype.startsWith("image")) {
                contentType = ContentType.IMAGE;
            } else {
                return res.status(400).json(new ApiResponse(400, {}, "unexpected file"));
            }

        } else if (content?.trim) {
            contentType = ContentType.TEXT;
        } else {
            return res.status(400).json(new ApiResponse(400, {}, "unexpected content type"));
        }

        const sendMessage = await prisma.message.create({
            data: {
                userUserId: +senderId,
                content: content,
                imageOrVideoUrl: imageOrVideoUrl,
                contentType,
                receiverUser: +receiverId,
                messageStatus
            }
        });

        await prisma.conversation.update({
            where: { conversationId: conversation.conversationId },
            data: {
                messageMessageId: sendMessage.MessageId,
                unreadCount: conversation.unreadCount++
            }
        });

        if (req.io && req.socketUserMap) {
            const receiverSocketId = req.socketUserMap.get(receiverId);

            if (receiverSocketId) {
                req.io.to(receiverSocketId).emit("receive_message", sendMessage);

                prisma.message.update({
                    where: {
                        MessageId: sendMessage.MessageId
                    },
                    data: {
                        messageStatus: "delivered"
                    }
                })
            }
        }

        return res.status(201).json(new ApiResponse(201, sendMessage, "Send message successfully"));

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
});


const getAllconversation = asyncHandler(async (req, res) => {
    try {

        const userId = req.user.userId;

        const conversation = userId
            ? await prisma.conversation.findMany({
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

        return res.status(201).json(new ApiResponse(201, conversation, "get all conversation"));
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
});


const getMessage = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;

    try {
        const userId = req.user.userId;

        const conversation = userId
            ? await prisma.conversation.findFirst({

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
            return res.status(500).json(new ApiResponse(500, {}, "Conversation not found"));
        }

        const message = await prisma.message.findMany({
            where: {
                conversation: {
                    some: {
                        conversationId: { equals: +conversationId }
                    }
                }
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

        await prisma.message.updateMany({
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

        await prisma.conversation.update({
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

        return res.status(201).json(new ApiResponse(201, message, "get all massage in this conversation"));
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Server error"));
    }
})


const makeAsRead = asyncHandler(async (req, res) => {
    const { messageIds } = req.body;

    try {
        const userId = req.user.userId;

        const messages = await prisma.message.findMany({
            where: {
                MessageId: {
                    in: messageIds
                },
                receiverUser: userId,
            }
        });

        await prisma.message.updateMany({
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
                const senderSocketId = req.socketUserMap.get(message.receiverUser);
                if (senderSocketId) {

                    prisma.message.update({
                        where: {
                            MessageId: message.MessageId
                        },
                        data: {
                            messageStatus: "read"
                        }
                    })

                    req.io?.to(senderSocketId).emit("message_read", sendMessage);

                }
            })
        }

        return res.status(201).json(new ApiResponse(201, messages, "make read all massage in this user"));

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Server error"));
    }
})

export { sendMessage, getAllconversation, getMessage, makeAsRead }