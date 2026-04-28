import express, { type Router } from "express";
import { requireAuth } from "../middlewares/authorization.js";
import { addFavourite, removeFavourite, getFavourites } from "../controllers/favouritesController.js";

const favouritesRouter: Router = express.Router();

favouritesRouter.post("/favourites", requireAuth, addFavourite);
favouritesRouter.delete("/favourites", requireAuth, removeFavourite);
favouritesRouter.get("/favourites", requireAuth, getFavourites);

export default favouritesRouter;



