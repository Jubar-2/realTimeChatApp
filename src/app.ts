import express from 'express';
import userRouter from "@/routes/user.routes";
import cookieParser from 'cookie-parser';
import messageRouter from "@/routes/message.route";
import http from "http";
import initializeSocket from './service/socket.service';

const app = express();

app.use(express.json())
app.use(cookieParser())

// socket server
const server = http.createServer(app);
const io = initializeSocket(server);

// use socket
app.use((req, _, next) => {
    req.io = io;
    req.socketUserMap = io.socketUserMap;
    next();
});

//routers
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter)

export { app };