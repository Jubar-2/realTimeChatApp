import "socket.io";

declare module "socket.io" {
    interface Server {
        socketUserMap: Map<number, string>; // এখানে type বদলাতে পারো (number/string ইত্যাদি)
    }
}