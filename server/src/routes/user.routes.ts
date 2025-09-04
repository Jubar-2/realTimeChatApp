import { allUsers, checkAuthorizeUser, loginUser, logOutUser, refreshAccessTokenClt, searchUsers, userRegister } from "@/controllers/user.controller";
import { verifyJWT } from "@/middlewares/auth/auth.middlewares";
import { signUpSchemaValidation } from "@/middlewares/validation/signUp.validation.middlewares";
import { Router } from "express";

const router = Router();

router.route("/registration").post(signUpSchemaValidation, userRegister);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/checkauthorize").post(verifyJWT, checkAuthorizeUser);
router.route("/refreshtoken").post(refreshAccessTokenClt);

router.route("/all-user").get(verifyJWT, allUsers);
router.route("/fiend-users").get(verifyJWT, searchUsers);

export default router;