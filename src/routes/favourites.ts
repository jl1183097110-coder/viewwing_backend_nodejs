import express, { type Router } from "express";
import { requireAuth } from "../middlewares/authorization.js";
import { addFavourite, removeFavourite, getFavourites, checkFavourite } from "../controllers/favouritesController.js";

const favouritesRouter: Router = express.Router();

// /favourites/check must be registered BEFORE /favourites
favouritesRouter.get("/favourites/check", requireAuth, checkFavourite);
favouritesRouter.get("/favourites", requireAuth, getFavourites);
favouritesRouter.post("/favourites", requireAuth, addFavourite);
favouritesRouter.delete("/favourites", requireAuth, removeFavourite);

export default favouritesRouter;



