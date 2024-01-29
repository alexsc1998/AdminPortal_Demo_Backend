import { Request, Response } from "express";
import type { CreateUser } from "@/users/service.js";
import * as UserService from "@/users/service.js";
import createHttpError from "http-errors";
import { ERRORS } from "@/utils/errors.js";

export async function httpCreateUsers(
  req: Request<
    {},
    {},
    {
      name: string;
      email: string;
      expireDate: string;
    }[]
  >,
  res: Response
) {
  const users: CreateUser[] = req.body.map((user) => {
    return {
      name: user.name,
      email: user.email,
      expireDate: new Date(user.expireDate),
    };
  });
  const result = await UserService.createUsers(users);
  if (result.error) {
    // if (
    //   result.error.includes('email address') ||
    //   result.error === ERRORS.INVALID_ID
    // ) {
    //   throw createHttpError.BadRequest(result.error);
    // }
    // throw createHttpError(result.error);
    res.status(201).json({ error: result.error });
  } else {
    res.status(201).json({ message: "success" });
  }
}

export async function httpUpdateUser(
  req: Request<
    {},
    {},
    {
      name: string;
      email: string;
      used?: boolean;
      expireDate: string;
    }
  >,
  res: Response
) {
  const user: {
    name: string;
    email: string;
    used: boolean;
    expireDate: Date;
  } = {
    name: req.body.name,
    email: req.body.email,
    used: req.body.used ?? false,
    expireDate: new Date(req.body.expireDate),
  };
  const result = await UserService.updateUser(user);
  if (result.error) {
    // if (
    //   result.error.includes('email address') ||
    //   result.error === ERRORS.INVALID_ID
    // ) {
    //   throw createHttpError.BadRequest(result.error);
    // }
    // throw createHttpError(result.error);
    res.status(201).json({ error: result.error });
  } else {
    res.status(201).json({ message: "success" });
  }
}

export async function httpGetAllUsers(req: Request, res: Response) {
  const result = await UserService.getAllUsers();
  if (result.error) {
    throw createHttpError(result.error);
  }
  const users = result.users?.map((user, index) => ({
    ...user,
    idx: index + 1,
  }));
  res.status(200).json({ obdlist: users });
}

export async function httpGetUser(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;

  const result = await UserService.getUser(id);
  if (result.error) {
    if (result.error === ERRORS.NOT_FOUND) {
      throw createHttpError.NotFound("user not found");
    }
    throw createHttpError(result.error);
  }
  res.status(200).json(result);
}

export async function httpDeleteUser(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params;
  const result = await UserService.deleteUser(id);
  if (result.error) {
    if (result.error === ERRORS.DELETE_FAILED) {
      throw createHttpError.NotFound(
        "Failed to delete the user, make your the user id is valid"
      );
    }
    throw createHttpError(result.error);
  }
  res.status(200).json(result);
}

export async function httpCheckQRCode(
  req: Request<{ id: string }>,
  res: Response
) {
  const { id } = req.params;
  const result = await UserService.checkQRCode(id);

  res.status(200).json(result);
}
