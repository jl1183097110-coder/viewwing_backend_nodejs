import express, { type Router } from "express";
import { createRegions, getSubRegions, getRegionPath } from "../controllers/regionController.js";
import { requireAdmin, requireAuth } from "../middlewares/authorization.js";



const regionRouter: Router = express.Router();


regionRouter.post('/regions', requireAuth, requireAdmin, createRegions);
regionRouter.get('/regions', getSubRegions);
regionRouter.get('/regions/:id/path', getRegionPath);


export default regionRouter;





