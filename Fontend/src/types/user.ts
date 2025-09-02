export interface UserType {
    email: string,
    name: string;
    userId: number;
    username: string;
}

export interface UserStoreTypes {
    user: UserType | null;
    setUser: (user: UserType) => void;
    clearUser: () => void;
    isAuthorize: boolean;
}