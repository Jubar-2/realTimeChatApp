import express from 'express';
import userRouter from "@/routes/user.routes";

const app = express();

app.use(express.json())

//routers
app.use("/api/v1/user", userRouter);

export { app };