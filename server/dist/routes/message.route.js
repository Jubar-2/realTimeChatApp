"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middlewares_1 = require("../middlewares/auth/auth.middlewares");
const index_middleware_1 = require("../middlewares/multer/index.middleware");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.route("/send-message").post(index_middleware_1.upload.fields([
    { name: 'medea', maxCount: 5 }
]), chat_controller_1.sendMessage);
router.route("/get-conversation").get(auth_middlewares_1.verifyJWT, chat_controller_1.getAllConversation);
router.route("/:conversationId/get-message").get(auth_middlewares_1.verifyJWT, chat_controller_1.getMessage);
router.route("/marked-message").post(auth_middlewares_1.verifyJWT, chat_controller_1.makeAsRead);
exports.default = router;
