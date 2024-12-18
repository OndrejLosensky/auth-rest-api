import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";
import { reIssueAccessToken } from "../service/session.service";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = get(req, "headers.authorization", "").replace(
    /^Bearer\s/,
    ""
  );

  const refreshToken = get(req, "headers.x-refresh");

  if (!accessToken) {
    console.log("No access token found, proceeding without user"); // Log when no access token is present
    return next();
  }

  const { decoded, expired } = verifyJwt(accessToken, "accessTokenPublicKey");

  if (decoded) {
    console.log("Decoded user from access token:", decoded); // Log the decoded user
    res.locals.user = decoded;
    return next();
  }

  if (expired && refreshToken) {
    const token = Array.isArray(refreshToken) ? refreshToken[0] : refreshToken;
    const newAccessToken = await reIssueAccessToken({ refreshToken: token });

    if (newAccessToken) {
      res.setHeader("x-access-token", newAccessToken);
    }

    const result = verifyJwt(newAccessToken as string, "accessTokenPublicKey");

    console.log("Decoded user from new access token:", result.decoded); // Log the decoded user from new token
    res.locals.user = result.decoded;
    return next();
  }

  console.log("Access token expired and no refresh token available, proceeding without user"); // Log when both tokens are absent
  return next();
};
export default deserializeUser;