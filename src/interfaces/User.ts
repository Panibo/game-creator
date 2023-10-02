import {Document} from 'mongoose';
interface User extends Document {
  full_name: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
}

interface OutputUser {
  id?: string;
  full_name: string;
  email: string;
}

export {User, OutputUser};
