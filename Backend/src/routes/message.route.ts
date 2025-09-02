import { getAllConversation, getMessage, makeAsRead, sendMessage } from "@/controllers/chat.controller";
import { verifyJWT } from "@/middlewares/auth/auth.middlewares";
import { upload } from "@/middlewares/multer/index.middleware";
import { Router } from "express";

const router = Router();

router.route("/send-message").post(upload.fields([
    { name: 'medea', maxCount: 5 }
]), sendMessage);
router.route("/get-conversation").get(verifyJWT, getAllConversation);
router.route("/:conversationId/get-message").get(verifyJWT, getMessage);
router.route("/marked-message").post(verifyJWT, makeAsRead);

export default router;