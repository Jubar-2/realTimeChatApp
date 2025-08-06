import { sendMessage } from "@/controllers/chat.controller";
import { loginUser, logOutUser, userRegister } from "@/controllers/user.controller";
import { verifyJWT } from "@/middlewares/auth/auth.middlewares";
import { signUpSchemaValidation } from "@/middlewares/validation/signUp.validation.middlewares";
import { Router } from "express";

const router = Router();

router.route("/registration").post(signUpSchemaValidation, userRegister);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logOutUser)

export default router;