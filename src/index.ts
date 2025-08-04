import 'dotenv/config';
import {app} from "@/app";

app.listen(process.env.port || 8001, () => {
    console.log(`server is starting on port: ${process.env.port}`);
})