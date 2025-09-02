
declare namespace NodeJS {
    interface ProcessEnv {
        REFRESH_ACCESS_TOKEN: string;
        REFRESH_ACCESS_EXPIRE: string;
        ACCESS_SECRET_TOKEN: string;
        ACCESS_TOKEN_EXPIRE: string;
    }
}