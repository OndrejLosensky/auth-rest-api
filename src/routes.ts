import { Express, Request, Response, RequestHandler } from "express"
import validateResource from "./middleware/validateResource";
import { createUserHandler } from "./controllers/user.controller";
import { createUserSchema } from "./schema/user.schema";

function routes(app: Express) {
    app.get("/healthcheck", ((req: Request, res: Response) => {
        res.sendStatus(200);
    }) as RequestHandler);

    app.post("/api/users", validateResource(createUserSchema), createUserHandler);
}

export default routes;