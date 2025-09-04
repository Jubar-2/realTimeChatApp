import { getSocket } from "@/service/chat.service";
import axios from "axios";
import { create } from "zustand";
import peer from "@/service/PeerService.service"

interface Message {
    MessageId: number;
    conversationId: number;
    content: string;
    imageOrVideoUrl: string | null;
    userUserId: number;
    receiverUser: number;
    contentType: string;
    messageStatus: string;
    createdAt: string;
    updatedAt: string;
}

interface Conversation {
    conversationId: number;
    unreadCount: number;
    messageMessageId: number;
    createdAt: string;
    updatedAt: string;
    lastMessage: Message | null;
}

interface Participant {
    participantId: number;
    userId: number;
    conversationId: number;
    createdAt: string;
    updatedAt: string;
    conversation: Conversation;
}

export interface UserConversation {
    avatar: string | null;
    email: string;
    isOnline: boolean;
    lastSeen: string | null;
    name: string;
    statusStatusId: number | null;
    userId: number;
    username: string;
    ConversationParticipant: Participant[];
}

const conversionsSorting = (data: UserConversation[]) => {
    data?.sort((a, b) => {
        const getLatestTime = (participants: any[]) => {
            // console.log(participants)
            if (!participants.length) return 0;
            return Math.max(...participants.map(p =>
                new Date(p.conversation.lastMessage.createdAt).getTime())
            )
        };

        const aTime = getLatestTime(a.ConversationParticipant);
        const bTime = getLatestTime(b.ConversationParticipant);
        return bTime - aTime; // Descending (newest first)
    });

}

interface ChatStore {
    conversions: UserConversation[];
    currentConversion: number | null;
    messages: Message[];
    error: any;
    currentUser: any; // You can type it properly if you have a User interface
    onlineUsers: Map<number, { isOnline: boolean; lastSeen: string | null }>;
    typingUsers: Map<number, Set<number>>;
    loading: boolean;
    myStream: MediaStream | null;
    incomingCall: boolean;
    incomingCallData: {
        from: number;
        offer: any;
    } | null;

    initSocketListener: () => void;
    setCurrentUser: (user: any) => void;
    setConversations: (data: UserConversation[]) => void;
    fetchConversations: () => Promise<any>;
    fetchMessages: (conversationId: number) => Promise<Message[]>;
    sendMessage: (formData: FormData) => Promise<any>;
    receiveMessage: (message: Message) => void;
    updateUnreadCount: (conversionId: number) => void;
    updateConversations: (message: Message) => void;
    isUserOnline: (userId: number) => boolean | null;
    startTyping: (receiverId: number) => void;
    stopTyping: (receiverId: number) => void;
    isUserTyping: (userId: number) => boolean | null;
    sendStreams: () => void;
    cancelCall: () => void;
    handleCallUser: () => Promise<Boolean>;
    cleanup: () => void;
}

interface importedStatus {
    userId: number;
    isOnline: boolean;
    lastSeen: Date | null;
}

export const useChatStore = create<ChatStore>((set, get) => ({
    conversions: [],
    currentConversion: null,
    messages: [],
    error: null,
    currentUser: null,
    onlineUsers: new Map(),
    typingUsers: new Map(),
    loading: false,
    myStream: null,
    incomingCall: false,
    incomingCallData: null,


    // socket event listeners setup
    initSocketListener: () => {
        const socket = getSocket();

        if (!socket) return;

        socket.off("receive_message");
        socket.off("user_typing");
        socket.off("user_status");
        socket.off("message_send");
        socket.off("message_error");
        socket.off("incoming_call");
        socket.off("call:accepted");
        socket.off("peer:nego:final");

        // linting for including message
        socket.on("receive_message", (message) => {
            get().receiveMessage(message)
        });

        // listener for typing users
        socket.on("user_typing", ({ userId, conversionId, isTyping }) => {
            set((state) => {
                const newTypingUsers = new Map(state.typingUsers);

                if (!newTypingUsers.has(conversionId)) {
                    newTypingUsers.set(conversionId, new Set());
                }

                const typingSet = newTypingUsers.get(conversionId);

                console.log("user_typing", typingSet)

                if (isTyping && typingSet) {
                    typingSet.add(userId);
                } else {
                    typingSet?.delete(userId);
                }

                return { typingUsers: newTypingUsers }
            });

        });

        socket.on("incoming_call", async ({ from, offer }) => {


            try {

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: true,
                });

                set({
                    myStream: stream,
                    incomingCall: true,
                    incomingCallData: { from, offer }
                });

            } catch (error) {
                console.log(error)
            }

        });

        socket.on("call:accepted", async ({ ans }) => {
            console.log("Call Accepted!");
            await peer.setLocalDescription(ans);
            get().sendStreams();
        });

        socket.on("peer_nego_needed", async ({ from, offer }) => {
            console.log("pre nego offer", offer)
            const ans = await peer.getAnswer(offer);
            console.log("peer:nego:needed")
            socket.emit("peer:nego:done", { to: from, ans });
        });

        socket.on("peer:nego:final", async ({ ans }) => {
            console.log("final nego")
            await peer.setLocalDescription(ans);
        });

        socket.on("cancel_video_call", () => {
            console.log("cancel_video_call")
            const { cancelCall } = get();
            cancelCall()
        });

        socket.on("cancel_out_going_video_call", () => {
            set({ myStream: null, incomingCall: false });
        });

        // track users online or offline status
        socket.on("user_status", ({ userId, isOnline }) => {
            set((state) => {
                const newOnlineUsers = new Map(state.onlineUsers);
                newOnlineUsers.set(userId, isOnline);
                console.log("user status", newOnlineUsers)
                return { onlineUsers: newOnlineUsers }
            });
        });

        // emit status check for all users in conversation list 
        const { conversions } = get();

        if (conversions && conversions?.length > 0) {
            conversions.forEach(element => {
                const otherUser = element.ConversationParticipant.find(
                    (p) => p?.userId !== get().currentUser?.userId
                );
                if (otherUser?.userId) {
                    socket.emit("get_user_status", otherUser.userId, (importedStatus: importedStatus) => {
                        // console.log(importedStatus)
                        // console.log(otherUser.userId)
                        set((status) => {
                            const newOnlineUsers: Map<number, { isOnline: boolean; lastSeen: string | null }> = new Map(status.onlineUsers);
                            newOnlineUsers.set(otherUser.userId, {
                                isOnline: importedStatus.isOnline,
                                lastSeen: importedStatus.lastSeen
                                    ? new Date(importedStatus.lastSeen).toISOString() // convert Date to string
                                    : null
                            });
                            return { onlineUsers: newOnlineUsers }
                        });
                        // console.log("get map",get().onlineUsers)
                    })
                }
            });
        }
    },

    setCurrentUser: (user) => set({ currentUser: user }),

    setConversations: (data) => {
        const { initSocketListener } = get();
        conversionsSorting(data)
        set({ conversions: data, loading: false });
        initSocketListener();
    },

    fetchConversations: async () => {
        set({ loading: true, error: null });

        try {
            const { data } = await axios.get("/api/v1/message/get-conversation");
            set({ conversions: data.data, loading: false });

            get().initSocketListener();
            // console.log(data)
            return data;
        } catch (error) {
            set({
                error: error,
                loading: false
            });

            return null;
        }
    },

    fetchMessages: async (conversationId) => {

        if (!conversationId) return;

        set({ loading: true, error: null });

        // console.log(data)
        try {
            const { data } = await axios.get(`/api/v1/message/${conversationId}/get-message`);

            const messageArray = data.data || [];
            // console.log(messageArray)
            set({
                messages: messageArray,
                currentConversion: conversationId,
                loading: false
            });

            get().updateUnreadCount(conversationId)

            return messageArray;
        } catch (error) {
            set({
                error: error,
                loading: false
            });

            return [];
        }
    },

    sendMessage: async (formData) => {
        const senderId = formData.get("senderId");
        const receiverId = formData.get("receiverId");
        const content = formData.get("content") as string;
        const status = formData.get("messageStatus") as string;

        const { currentConversion, updateConversations, stopTyping } = get();

        stopTyping(Number(receiverId));

        // tempId message before response
        const tempId = Number(`00${Math.random() * 10}`);

        const optimisticMessage: Message = {
            MessageId: tempId, // temp id
            conversationId: currentConversion || 0,
            content: content || "",
            imageOrVideoUrl: null,
            userUserId: Number(senderId),
            receiverUser: Number(receiverId),
            contentType: "TEXT",
            messageStatus: status || "sending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        set((state) => ({
            messages: [...state.messages, optimisticMessage]
        }));

        try {
            const { data } = await axios.post("/api/v1/message/send-message", formData, { headers: { "Content-Type": "multipart/form-data" } });
            const messageData = data.data || data;

            set((state) => ({
                messages: state?.messages.map((msg) =>
                    msg.MessageId === tempId ? messageData : msg
                )
            }));

            updateConversations(messageData)

            return messageData;

        } catch (error) {
            console.error("error sending message", error);
            set((state) => (
                {
                    messages: state.messages.map((msg) => msg.MessageId === tempId ? { ...msg, messageState: "failed" } : msg),
                    error: error
                }
            ));
            throw error;
        }
    },

    receiveMessage: (message) => {
        if (!message) return;

        const { currentConversion, updateConversations, messages } = get();

        const messageExist = messages.some((msg) => msg.MessageId === message.MessageId);

        if (messageExist) return;

        if (message.conversationId === currentConversion) {
            set((state) => ({
                messages: [...state.messages, message]
            }));

        }

        updateConversations(message)

    },

    updateUnreadCount: (conversionId) => {
        if (!conversionId) return;

        set((state) => {

            const updateConversations = state.conversions?.map((conversion: UserConversation) => {

                if (conversion.ConversationParticipant[0].conversation.conversationId === conversionId) {
                    return {
                        ...conversion,
                        ConversationParticipant: [
                            {
                                ...conversion.ConversationParticipant[0],
                                conversation: {
                                    ...conversion.ConversationParticipant[0].conversation,
                                    unreadCount: 0
                                },
                            },
                        ],
                    };
                }

                return conversion;
            })

            conversionsSorting(updateConversations)

            return {
                conversions: updateConversations
            }
        })
    },

    updateConversations: (message: Message) => {
        const { currentUser } = get();

        if (!message) return;

        set((state) => {

            const updateConversations = state.conversions.map((conversion: UserConversation) => {

                if (conversion.ConversationParticipant[0].conversation.conversationId === message.conversationId) {
                    return {
                        ...conversion,
                        ConversationParticipant: [
                            {
                                ...conversion.ConversationParticipant[0],
                                conversation: {
                                    ...conversion.ConversationParticipant[0].conversation,
                                    lastMessage: message,
                                    unreadCount: message?.receiverUser === currentUser?.userId && conversion.ConversationParticipant[0].conversation.conversationId !== state.currentConversion ?
                                        (conversion.ConversationParticipant[0].conversation.unreadCount || 0) + 1 :
                                        conversion.ConversationParticipant[0].conversation.unreadCount || 0
                                },
                            },
                        ],
                    };
                }

                return conversion;
            })

            conversionsSorting(updateConversations)

            return {
                conversions: updateConversations
            }
        })
    },

    isUserOnline: (userId: number) => {
        if (!userId) return null;
        const { onlineUsers } = get();
        const status = onlineUsers.get(userId);
        return status ? typeof status === "boolean" ? status : status.isOnline : null;
    },

    startTyping: (receiverId: number) => {
        const { currentConversion } = get();
        const socket = getSocket();
        if (socket && currentConversion) {
            socket.emit("typing_start", {
                conversionId: currentConversion,
                receiverId
            });
        }
    },

    stopTyping: (receiverId: number) => {
        const { currentConversion } = get();
        const socket = getSocket();
        if (socket && currentConversion && receiverId) {
            socket.emit("typing_stop", {
                conversionId: currentConversion,
                receiverId
            });
        }
    },

    isUserTyping: (userId: number) => {
        if (!userId) return null;

        const { typingUsers, currentConversion } = get();

        if (!currentConversion || !typingUsers.has(currentConversion) || !userId) {
            return false;
        }

        return typingUsers.get(currentConversion)?.has(userId) || false;
    },

    handleCallUser: async () => {
        const { currentConversion, conversions } = get();

        if (!currentConversion) return false

        try {

            const conversion = conversions.find(element =>
                element.ConversationParticipant[0].conversationId === currentConversion
            );

            const socket = getSocket();
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true,
            });
            const offer = await peer.getOffer();
            set({ myStream: stream });
            socket.emit("user_video_call", { to: conversion?.userId, offer });
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    },

    sendStreams: () => {
        const { myStream } = get();
        if (myStream) {
            for (const track of myStream.getTracks()) {
                peer.peer.addTrack(track, myStream);
            }
        }
    },

    handleNegoNeeded: async () => {
        const { currentUser, conversions, currentConversion } = get();
        const socket = getSocket();
        const offer = await peer.getOffer();

        const conversion = conversions.find(element =>
            element.ConversationParticipant[0].conversationId === currentConversion
        );

        console.log("handel nego needed")
        socket.emit("peer:nego:needed", { offer, to: currentUser.userId === conversion?.userId });
    },

    cancelIncomingCall: () => {
        const { incomingCallData } = get();
        if (!incomingCallData) return;

        const socket = getSocket();
        socket.emit("cancel_video_call", { ...incomingCallData });

        set({ myStream: null, incomingCall: false, incomingCallData: null });

    },

    acceptVideoCall: async () => {

        const { incomingCallData } = get();

        const socket = getSocket();

        const ans = await peer.getAnswer(incomingCallData?.offer);
        socket.emit("call_accepted", { to: incomingCallData?.from, ans });
    },

    cancelCall: () => {
        const { conversions, currentConversion } = get();
        const socket = getSocket();
        set({ myStream: null, incomingCallData: null });

        const conversion = conversions.find(element =>
            element.ConversationParticipant[0].conversationId === currentConversion
        );

        socket.emit(
            "cancel_out_going_video_call",
            { to: conversion?.userId }
        )

    },

    cleanup: () => {
        set({
            conversions: [],
            currentConversion: null,
            messages: [],
            error: null,
            currentUser: null,
            onlineUsers: new Map(),
            typingUsers: new Map()
        })
    }


}))
