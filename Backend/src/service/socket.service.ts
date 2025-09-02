import prisma from "@/db";
import { Server } from "socket.io";
import { Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';
import { clearTimeout } from "timers";

// store all online users
const onLineUsers = new Map();

// Store all users who are typing now.
const typingUsers = new Map();

const initializeSocket = (server: HTTPServer | HTTPSServer) => {
    const io = new Server(server, {
        cors: {
            origin: [
                process.env.FRONTEND_URL || "http://192.168.0.111:5173/chat",
                "http://localhost:5173"
            ],
            credentials: true,
            methods: ['GET', 'PUT', 'POST', 'DELETE'],
        },
        pingTimeout: 60000,
    });

    io.on("connection", (socket) => {
        console.log(`User connection: ${socket.id}`);
        let userId: number | null = null;

        socket.on("user_connected", async (connectingUserId: number) => {
            try {
                console.log("user is connect", connectingUserId)

                userId = connectingUserId;
                onLineUsers.set(userId, socket.id);
                // console.log("get user",onLineUsers.get(userId))
                // console.log("user is connect", connectingUserId)
                socket.join(`${userId}`);

                // update status in db
                await prisma.user.update({
                    where: {
                        userId
                    },
                    data: {
                        isOnline: true,
                        lastSeen: new Date(),
                    }
                });

                // notify all users that this user is now online
                io.emit("user_status", { userId, isOnline: true });

            } catch (error) {
                console.log("Error handling user connection", error);
            }
        });

        socket.on("get_user_status", (requestedUserId, cb) => {
            const isOnline = onLineUsers.has(requestedUserId);
            cb({
                userId: requestedUserId,
                isOnline,
                lastSeen: isOnline ? new Date() : null
            });
        });

        socket.on("send_message", (message) => {
            try {
                const receiverSocketId = onLineUsers.get(message.receiver?.id);

                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receive_message", message)
                }
            } catch (error) {
                console.log("Error sending message:", error);
                socket.emit("message_error", { error: "Failed to sending message" });
            }
        });

        socket.on("message_read", async (messageIds: number[], senderId) => {
            try {
                await prisma.message.updateMany({
                    where: {
                        MessageId: {
                            in: messageIds
                        }
                    },
                    data: {
                        messageStatus: "read"
                    }
                });

                const senderSocketId = onLineUsers.get(senderId);

                if (senderSocketId) {
                    messageIds.forEach((messageId) => {
                        io.to(senderSocketId).emit("message_status_update", {
                            messageId,
                            messageStatus: "read"
                        });
                    });
                }

            } catch (error) {
                console.log("Error handling message status update", error);
            }
        });

        socket.on("typing_start", ({ conversionId, receiverId }) => {
            if (!userId || !conversionId || !receiverId) return;

            if (!typingUsers.has(userId)) typingUsers.set(userId, {});

            const userTyping = typingUsers.get(userId);

            userTyping[conversionId] = true;

            // clear any existing timeout
            if (userTyping[`${conversionId}_timeout`]) {
                clearTimeout(userTyping[`${conversionId}_timeout`]);
            }

            const receiverSocketId = onLineUsers.get(receiverId)

            // auto stop 
            userTyping[`${conversionId}_timeout`] = setTimeout(() => {
                userTyping[conversionId] = true;
                socket.to(receiverSocketId).emit("user_typing", {
                    userId,
                    conversionId,
                    isTyping: false
                });
            }, 3000);

            // notify receiver
            socket.to(receiverSocketId).emit("user_typing", {
                userId,
                conversionId,
                isTyping: true
            })
        });

        socket.on("typing_stop", ({ conversionId, receiverId }) => {
            if (!userId || !conversionId || !receiverId) return;

            if (typingUsers.has(userId)) {
                const userTyping = typingUsers.get(userId);
                userTyping[conversionId] = false;

                if (userTyping[`${conversionId}_timeout`]) {
                    clearTimeout(userTyping[conversionId]);
                    delete userTyping[`${conversionId}_timeout`];
                }
            }

            const receiverSocketId = onLineUsers.get(receiverId)

            socket.to(receiverSocketId).emit("user_typing", {
                userId,
                conversionId,
                isTyping: false
            });
        });

        // for video call
        socket.on("user_video_call", ({ to, offer }) => {
            if (!onLineUsers.has(to)) return

            const receiverSocketId = onLineUsers.get(to);

            io.to(receiverSocketId).emit("incoming_call", { from: userId, offer });
        });

        socket.on("cancel_video_call", ({ from }) => {
            const receiverSocketId = onLineUsers.get(from);
            io.to(receiverSocketId).emit("cancel_video_call");

        })

        socket.on("call_accepted", ({ to, ans }) => {
            const receiverSocketId = onLineUsers.get(to);
            console.log("call accepted",to,receiverSocketId)
            io.to(receiverSocketId).emit("call:accepted", { from: userId, ans });
        });

        socket.on("cancel_out_going_video_call", ({ to }) => {
            const receiverSocketId = onLineUsers.get(to);
            io.to(receiverSocketId).emit("cancel_out_going_video_call");
        })

        socket.on("peer:nego:needed", ({ to, offer }) => {
            console.log("peer:nego:needed", offer);
            const receiverSocketId = onLineUsers.get(to);
            io.to(receiverSocketId).emit("peer_nego_needed", { from: userId, offer });
        });

        socket.on("peer:nego:done", ({ to, ans }) => {
            const receiverSocketId = onLineUsers.get(to);
            io.to(receiverSocketId).emit("peer:nego:final", { from: userId, ans });
        });

        // add and update reaction
        // socket.on("add_reaction", async (messageId, emoji, userId, reactionUserId) => {
        //     try {
        //         const message = await prisma.message.findFirst({
        //             where: {
        //                 MessageId: messageId
        //             },
        //             include:{
        //                 reaction: true
        //             }
        //         });

        //         if(message) return;

        //         // const existingIndex = message.reaction()
        //     } catch (error) {
        //         console.log("Error handling message status update", error);
        //     }
        // })

        // handle disconnect
        const handleDisconnect = async () => {
            if (!userId) return;

            try {
                onLineUsers.delete(userId);

                // clear all typing timeout 
                if (typingUsers.has(userId)) {
                    const userTyping = typingUsers.get(userId);
                    Object.keys(userTyping).forEach(key => {
                        if (key.endsWith('_timeout')) clearTimeout(userTyping[key])
                    });

                    typingUsers.delete(userId);
                }

                await prisma.user.update({
                    data: {
                        isOnline: false,
                        lastSeen: new Date()
                    },
                    where: {
                        userId
                    }
                });

                io.emit("user_status", {
                    userId,
                    isOnline: false,
                    lastSeen: new Date()
                });

                socket.leave(`${userId}`);
            } catch (error) {
                console.log("handle disconnection error:", error)
            }
        }

        socket.on("disconnect", handleDisconnect);

    });

    io.socketUserMap = onLineUsers;

    return io;

}

export default initializeSocket;