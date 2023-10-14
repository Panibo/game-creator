import { Request, Response, NextFunction } from 'express';
import CustomError from '../../classes/CustomError';
import { OutputUser, User } from '../../interfaces/User';
import { validationResult } from 'express-validator';
import userModel from '../models/userModel';
import bcrypt from 'bcrypt';
import DBMessageResponse from '../../interfaces/DBMessageResponse';
import jwt from 'jsonwebtoken';

const check = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is alive' });
};

const userListGet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userModel.find().select('-password -role -__v');
    const response: DBMessageResponse = {
      message: 'Users found',
      data: users,
    };

    res.json(response);
  } catch (error) {
    next(new CustomError('Users not found', 500));
  }
};

const userGet = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select('-password -role -__v');

    if (!user) {
      next(new CustomError('User not found', 404));
      return;
    }

    const response: DBMessageResponse = {
      message: 'User found',
      data: user,
    };

    res.json(response);
  } catch (error) {
    next(new CustomError('User not found', 500));
  }
};

const userPost = async (
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => `${error.msg}: ${error.param}`)
        .join(', ');
      next(new CustomError(messages, 400));
      return;
    }

    const user = req.body;
    console.log('postUser', user);
    user.password = await bcrypt.hash(user.password, 12);

    const newUser = await userModel.create(user);
    const response: DBMessageResponse = {
      message: 'User created',
      data: {
        full_name: newUser.full_name,
        email: newUser.email,
        id: newUser._id,
      },
    };

    res.json(response);
  } catch (error) {
    console.log(error);
    next(new CustomError('User creation failed', 500));
  }
};

const userPut = async (
  req: Request<{ id: string }, {}, User>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    const updatedUser = req.body;

    // TODO: Implement user update logic here

    const response: DBMessageResponse = {
      message: 'User updated',
      data: updatedUser,
    };

    res.json(response);
  } catch (error) {
    next(new CustomError('User update failed', 500));
  }
};


const userDelete = async (
  req: Request<{ id: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;

    // TODO: Implement user deletion logic here

    const response: DBMessageResponse = {
      message: 'User deleted',
      data: [] as OutputUser[],
    };

    res.json(response);
  } catch (error) {
    next(new CustomError('User deletion failed', 500));
  }
};


const checkToken = (req: Request, res: Response) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decodedToken.exp && decodedToken.exp < currentTimestamp) {
      res.status(401).json({ message: 'Token has expired' });
    } else {
      res.status(200).json({ message: 'Token is valid' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid' });
  }
};

export {
  check,
  userListGet,
  userGet,
  userPost,
  userPut,
  userDelete,
  checkToken,
};
