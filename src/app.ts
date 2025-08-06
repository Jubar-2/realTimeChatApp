import express from 'express';
import userRouter from "@/routes/user.routes";
import cookieParser from 'cookie-parser';
import messageRouter from "@/routes/message.route"

const app = express();

app.use(express.json())
app.use(cookieParser())

//routers
app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter)

export { app };