import { Request, Response, NextFunction } from "express";

const requireUser = (req: Request, res: Response, next: NextFunction): void => {
  const user = res.locals.user;

  console.log("User in requireUser middleware:", user); // Log the user object

  if (!user) {
    console.log("No user found, sending 403 Forbidden"); // Log when user is not found
    res.sendStatus(403);
    return;
  }

  next();
};

export default requireUser;