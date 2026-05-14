import express, { type Router } from "express";
import { requireAuth } from "../middlewares/authorization.js";
import {
  createSpots,
  updateSpots,
  deleteSpot,
  getSpot,
} from "../controllers/spotController.js";
import {
  addMediaToSpot,
  deleteMediaFromSpot,
} from "../controllers/mediaController.js";

const spotsRouter: Router = express.Router();

spotsRouter.post("/spots", requireAuth, createSpots);
spotsRouter.put("/spots/:spot_id", requireAuth, updateSpots);
spotsRouter.delete("/spots/:spot_id", requireAuth, deleteSpot);
spotsRouter.post("/spots/:spot_id/media", requireAuth, addMediaToSpot);
spotsRouter.delete("/spots/:spot_id/media/:media_id", requireAuth, deleteMediaFromSpot);
spotsRouter.get("/spots/:spot_id", getSpot);

export default spotsRouter;
