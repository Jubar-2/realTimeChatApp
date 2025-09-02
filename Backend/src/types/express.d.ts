import { User } from '@/types/auth';
import { Server } from "socket.io";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      io?: Server;
      socketUserMap?: Map;
    }
  }
}
