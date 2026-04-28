import express, { type Router } from "express";
import {
  createLocation,
  deleteLocation,
  getLocationDetail,
  getLocationPosts,
  getLocations,
  getLocationSpots,
  getNearLocations,
  searchLocations,
  updateLocation,
} from "../controllers/locationController.js";
import { requireAuth } from "../middlewares/authorization.js";

const locationRouter: Router = express.Router();

locationRouter.get("/locations", getLocations);
locationRouter.post("/locations", requireAuth, createLocation);
locationRouter.put("/locations/:id", requireAuth, updateLocation);
locationRouter.delete("/locations/:id", requireAuth, deleteLocation);
locationRouter.get("/locations/search", searchLocations);
locationRouter.get("/locations/nearby", getNearLocations);
locationRouter.get("/locations/:id/spots", getLocationSpots);
locationRouter.get("/locations/:id", getLocationDetail);
locationRouter.get("/locations/:id/posts", getLocationPosts);

export default locationRouter;
