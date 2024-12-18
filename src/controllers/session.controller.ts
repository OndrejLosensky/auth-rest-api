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
  const user = await validatePassword(req.body);

  if (!user) {
    res.status(401).send("Invalid email or password");
    return;
  }
  
  const userId = user._id.toString(); 
  const session = await createSession(userId, req.get("user-agent") || "");

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

  res.send({ accessToken, refreshToken });
}
export async function getUserSessionsHandler(req: Request, res: Response): Promise<void> {
  const userId = res.locals.user._id;
  const query = { user: userId, valid: true }; 
  const sessions = await findSessions(query);

  res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response): Promise<void> {
  const sessionId = req.body.sessionId; 

  console.log("Received session ID for deletion:", sessionId); // Log the session ID received

  if (!sessionId) {
    console.log("Session ID is required, sending 400 Bad Request"); // Log when session ID is missing
    res.status(400).send("Session ID is required");
    return;
  }

  const updatedSession = await updateSession({ _id: sessionId }, { valid: false });
  console.log("Updated session result:", updatedSession); // Log the result of the update operation

  if (updatedSession.modifiedCount === 0) {
    console.log("Session not found or already deleted, sending 404 Not Found"); // Log when session is not found
    res.status(404).send("Session not found or already deleted");
    return;
  }

  console.log("Session deleted successfully, sending response"); // Log successful deletion
  res.send({
    accessToken: null,
    refreshToken: null,
  });
}