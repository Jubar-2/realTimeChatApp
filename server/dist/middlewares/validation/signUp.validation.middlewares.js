"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchemaValidation = signUpSchemaValidation;
const signUp_schema_1 = require("../../schema/signUp.schema");
const ApiResponse_1 = require("../../utils/ApiResponse");
const zod_1 = require("zod");
function signUpSchemaValidation(req, res, next) {
    const { email, username, password, name } = req.body;
    const result = signUp_schema_1.signUpSchema.safeParse({ email, username, password, name });
    if (!result.success) {
        // Short and clear error message
        const formattedErrors = zod_1.z.flattenError(result.error);
        return res.status(401).json(new ApiResponse_1.ApiResponse(401, formattedErrors.fieldErrors, "Sign up validation error"));
    }
    next();
}
