import { userRegister } from "@/controllers/user.controller";
import { signUpSchemaValidation } from "@/middlewares/validation/signUp.validation.middlewares";
import { Router } from "express";

const router = Router();

router.route("/registration").post(signUpSchemaValidation, userRegister);

export default router;