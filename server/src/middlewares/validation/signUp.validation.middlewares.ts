import { signUpSchema } from "@/schema/signUp.schema"
import { ApiResponse } from "@/utils/ApiResponse";
import { NextFunction, Response, Request } from "express";
import { z } from "zod"

function signUpSchemaValidation(req: Request, res: Response, next: NextFunction) {
    const { email, username, password, name } = req.body;
    const result = signUpSchema.safeParse({ email, username, password, name });

    if (!result.success) {
        // Short and clear error message
        const formattedErrors = z.flattenError(result.error);

        return res.status(401).json(
            new ApiResponse(401, formattedErrors.fieldErrors, "Sign up validation error")
        );
    }

    next();

}

export { signUpSchemaValidation }