"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = exports.usernameValidation = void 0;
const zod_1 = require("zod");
exports.usernameValidation = zod_1.z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(20, "Username must be no more than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters");
exports.signUpSchema = zod_1.z.object({
    username: exports.usernameValidation,
    name: zod_1.z
        .string()
        .min(1, "Username must be at least 2 characters")
        .max(20, "Username must be no more than 20 characters"),
    email: zod_1.z.string().email({ message: "Invalid email address" }),
    password: zod_1.z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),
});
