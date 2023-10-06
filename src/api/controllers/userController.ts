import { Request, Response, NextFunction } from 'express';
import CustomError from '../../classes/CustomError';
import { OutputUser, User } from '../../interfaces/User';
import { validationResult } from 'express-validator';
import userModel from '../models/userModel';
import bcrypt from 'bcrypt';
import DBMessageResponse from '../../interfaces/DBMessageResponse';

// TODO: add function to check if the server is alive
const check = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is alive' });
};

// TODO: add function to get all users
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

// TODO: add function to get a user by id
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

// TODO: add function to create a user
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

// TODO: add function to update a user
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

// TODO: add function to delete a user
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

// TODO: add function to check if a token is valid
const checkToken = (req: Request, res: Response) => {
  // TODO: Implement token validation logic here
  res.status(200).json({ message: 'Token is valid' });
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
