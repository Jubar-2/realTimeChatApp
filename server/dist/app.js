"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const express_1 = __importDefault(require("express"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const message_route_1 = __importDefault(require("./routes/message.route"));
const http_1 = __importDefault(require("http"));
const socket_service_1 = __importDefault(require("./service/socket.service"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// socket server
const server = http_1.default.createServer(app);
exports.server = server;
const io = (0, socket_service_1.default)(server);
// use socket
app.use((req, _, next) => {
    req.io = io;
    req.socketUserMap = io.socketUserMap;
    next();
});
//routers
app.use("/api/v1/user", user_routes_1.default);
app.use("/api/v1/message", message_route_1.default);
