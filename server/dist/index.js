"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
app_1.server.listen(process.env.port || 8001, () => {
    console.log(`server is starting on port: ${process.env.port}`);
});
