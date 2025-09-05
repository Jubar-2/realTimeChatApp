"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUploadFileOncloudinary = exports.uploadOnCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const console_1 = require("console");
const fs_1 = __importDefault(require("fs"));
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_NAME_API_KEY,
    api_secret: process.env.CLOUDINARY_NAME_API_SECRET
});
const uploadOnCloudinary = async (loaclFilePath) => {
    try {
        if (!loaclFilePath)
            return null;
        const response = await cloudinary_1.v2.uploader.upload(loaclFilePath, {
            resource_type: "auto"
        });
        console.log("File upload on cloudinary", response.url);
        return response;
    }
    catch (err) {
        console.log(err);
        fs_1.default.unlinkSync(loaclFilePath);
        return null;
    }
    finally {
        fs_1.default.unlink(loaclFilePath, () => {
            console.log("temp clear");
        });
    }
};
exports.uploadOnCloudinary = uploadOnCloudinary;
const deleteUploadFileOncloudinary = async (publicId, resourceType) => {
    try {
        return await cloudinary_1.v2.uploader.destroy(publicId, {
            resource_type: resourceType
        });
    }
    catch (err) {
        console.log(console_1.error);
        return null;
    }
};
exports.deleteUploadFileOncloudinary = deleteUploadFileOncloudinary;
