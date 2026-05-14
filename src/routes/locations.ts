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
import {
  addMediaToLocation,
  deleteMediaFromLocation,
} from "../controllers/mediaController.js";

const locationRouter: Router = express.Router();

locationRouter.get("/locations", getLocations);
locationRouter.post("/locations", requireAuth, createLocation);
locationRouter.put("/locations/:id", requireAuth, updateLocation);
locationRouter.delete("/locations/:id", requireAuth, deleteLocation);
locationRouter.get("/locations/search", searchLocations);
locationRouter.get("/locations/nearby", getNearLocations);
locationRouter.post("/locations/:location_id/media", requireAuth, addMediaToLocation);
locationRouter.delete("/locations/:location_id/media/:media_id", requireAuth, deleteMediaFromLocation);
locationRouter.get("/locations/:id/spots", getLocationSpots);
locationRouter.get("/locations/:id", getLocationDetail);
locationRouter.get("/locations/:id/posts", getLocationPosts);

export default locationRouter;
