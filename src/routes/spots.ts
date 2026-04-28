import express, { type Router } from "express";
import { requireAuth } from "../middlewares/authorization.js";
import {
  createSpots,
  updateSpots,
  deleteSpot,
  getSpot,
} from "../controllers/spotController.js";

const spotsRouter: Router = express.Router();

spotsRouter.post("/spots", requireAuth, createSpots);
spotsRouter.put("/spots/:id", requireAuth, updateSpots);
spotsRouter.delete("/spots/:spot_id", requireAuth, deleteSpot);
spotsRouter.get("/spots/:spot_id", getSpot);

export default spotsRouter;
