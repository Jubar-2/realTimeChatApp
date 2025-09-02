import prisma from "@/db";
import { ApiResponse } from "@/utils/ApiResponse";
import asyncHandler from "@/utils/asyncHandler";
import { ContentType } from "../../generated/prisma";
import { uploadOnCloudinary } from "@/utils/Cloudinary";

const createStatus = asyncHandler(async (req, res) => {
    try {
        const { content } = req.body;

        const senderId = req.user.userId;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        let imageOrVideoUrl = null;

        let setContentType: ContentType = ContentType.TEXT;

        if (files.midea) {

            const filePath = files?.midea[0]?.path;

            const uploadFile = await uploadOnCloudinary(filePath);

            if (!uploadFile?.secure_url) {
                return res.status(400).json(new ApiResponse(400, {}, "file error"));
            }

            imageOrVideoUrl = uploadFile.secure_url;

            if (files.midea[0].mimetype.startsWith("video")) {
                setContentType = ContentType.VIDEO;
            } else if (files.midea[0].mimetype.startsWith("image")) {
                setContentType = ContentType.IMAGE;
            } else {
                return res.status(400).json(new ApiResponse(400, {}, "unexpected file"));
            }

        } else if (content?.trim) {
            setContentType = ContentType.TEXT;
        } else {
            return res.status(400).json(new ApiResponse(400, {}, "unexpected content type"));
        }

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const sendMessage = await prisma.status.create({
            data: {
                userId: +senderId,
                content: imageOrVideoUrl || content,
                contentType: setContentType,
                expiresAt
            }
        });


        return res.status(201).json(new ApiResponse(201, sendMessage, "Send message successfully"));

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json(new ApiResponse(500, {}, "Internal server error"));
    }
});

export { createStatus }