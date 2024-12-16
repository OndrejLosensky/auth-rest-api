import { Request, Response } from "express";
import { omit } from "lodash";
import { CreateUserInput } from "../schema/user.schema";
import logger from "../utils/logger";
import mongoose from "mongoose";
import UserModel from "../models/user.model";

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput["body"]>,
  res: Response
) {
  try {
    const userData = new UserModel({
      _id: new mongoose.Types.ObjectId(),
      ...req.body,
    });
    const user = await userData.save();
    res.send(omit(user.toJSON(), "password"));
  } catch (e: any) {
    logger.error(e);
    res.status(409).send(e.message);
  }
}