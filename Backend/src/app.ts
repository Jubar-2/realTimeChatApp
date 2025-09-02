import express from 'express';
import userRouter from "@/routes/user.routes";
import cookieParser from 'cookie-parser';
import messageRouter from "@/routes/message.route";
import http from "http";
import initializeSocket from './service/socket.service';
import cors from 'cors'

const app = express();

app.use(cors({
    origin: ["http://localhost:5173","http://192.168.0.111:5173/"],
    credentials: true
}));

app.use(express.json())
app.use(cookieParser())

// socket server
const server = http.createServer(app);
const io = initializeSocket(server);

console.log(io.socketUserMap)

// use socket
app.use((req, _, next) => {
    req.io = io;
    req.socketUserMap = io.socketUserMap;
    next();
});

//routers
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter)

export { server };