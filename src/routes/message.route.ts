import { getAllconversation, getMessage, makeAsRead, sendMessage } from "@/controllers/chat.controller";
import { verifyJWT } from "@/middlewares/auth/auth.middlewares";
import { upload } from "@/middlewares/multer/index.middleware";
import { Router } from "express";

const router = Router();

router.route("/sendmessage").post(upload.fields([
    { name: 'midea', maxCount: 5 }
]), sendMessage);
router.route("/getconversation").get(verifyJWT, getAllconversation);
router.route("/:conversationId/getmessage").get(verifyJWT, getMessage);
router.route("/makereadmessage").post(verifyJWT, makeAsRead);

export default router;