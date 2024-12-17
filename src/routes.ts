import { Express, Request, Response, RequestHandler } from "express"
import validateResource from "./middleware/validateResource";
import { createUserHandler } from "./controllers/user.controller";
import { createUserSchema } from "./schema/user.schema";
import { createUserSessionHandler, getUserSessionsHandler, deleteSessionHandler } from "./controllers/session.controller";
import { createSessionSchema } from "./schema/session.schema";
import requireUser from "./middleware/requireUser";

function routes(app: Express) {
    app.get("/healthcheck", ((req: Request, res: Response) => {
        res.sendStatus(200);
    }) as RequestHandler);

    app.post("/api/users", validateResource(createUserSchema), createUserHandler as RequestHandler);

    app.post("/api/sessions", validateResource(createSessionSchema), createUserSessionHandler as RequestHandler);

    app.get("/api/sessions", getUserSessionsHandler as RequestHandler);

    app.delete("/api/sessions", deleteSessionHandler as RequestHandler);
}

export default routes;