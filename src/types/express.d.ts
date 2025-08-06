import { User } from '@/types/auth'; // Your user type

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
