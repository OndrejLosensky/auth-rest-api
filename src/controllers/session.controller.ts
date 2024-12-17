import { Request, Response } from "express";
import config from "config";
import {
  createSession,
  findSessions,
  updateSession,
} from "../service/session.service";
import { validatePassword } from "../service/user.service";
import { signJwt } from "../utils/jwt";

export async function createUserSessionHandler(req: Request, res: Response): Promise<void> {
  // Validate the user's password
  const user = await validatePassword(req.body);

  if (!user) {
    res.status(401).send("Invalid email or password");
    return;
  }

  // Create a session
  const session = await createSession(user.id, req.get("user-agent") || "");

  // Create access and refresh tokens
  const accessToken = signJwt(
    { ...user, session: session._id },
    "accessTokenPrivateKey",
    { expiresIn: config.get("accessTokenTtl") }
  );

  const refreshToken = signJwt(
    { ...user, session: session._id },
    "refreshTokenPrivateKey",
    { expiresIn: config.get("refreshTokenTtl") }
  );

  // Send tokens in the response
  res.send({ accessToken, refreshToken });
}

export async function getUserSessionsHandler(req: Request, res: Response): Promise<void> {
  const userId = res.locals.user._id;
  const sessions = await findSessions({ user: userId, valid: true });
  res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response): Promise<void> {
  const sessionId = res.locals.user.session;
  await updateSession({ _id: sessionId }, { valid: false });
  res.send({
    accessToken: null,
    refreshToken: null,
  });
}
