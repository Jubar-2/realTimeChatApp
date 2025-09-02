import 'dotenv/config';
import {server} from "@/app";

server.listen(process.env.port || 8001, () => {
    console.log(`server is starting on port: ${process.env.port}`);
})