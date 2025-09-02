
// request body fields
interface RegisterRequestBody {
    email: string;
    username: string;
    password: string;
    name: string;
}

interface LoginRequestBody {
    identifier: string;
    password: string;
}


// Public fields 
interface PublicUser {
    email: string;
    username: string;
    name: string;
}

interface User extends jwt.JwtPayload {
    userId: number;
    email: string;
    username: string;
    name: string;
    iat?: number;
    exp?: number;
}