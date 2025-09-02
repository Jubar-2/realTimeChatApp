import { io, Socket } from "socket.io-client";
import useUserStore from "@/store/user.store";

let socket: Socket | null = null;

export const initializeSocket = () => {
    if (socket) return socket;

    const user = useUserStore.getState().user;

    const BACK_END_URL = "http://localhost:5001";

    socket = io(BACK_END_URL, {
        withCredentials: true,
        transports: ["websocket", "polling"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    // connection event
    socket.on("connect", () => {
        console.log("socket connected", socket?.id);
        socket?.emit("user_connected", user?.userId);
    });

    socket.on("connect_error", (error) => {
        console.error("socket connection error", error);
    });

    socket.on("disconnect", (reason) => {
        console.log("socket disconnect", reason);
    });

    return socket;
}

export const getSocket = () => {
    if (!socket) {
        return initializeSocket();
    }

    return socket;
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect;
        socket = null;
    }               
}