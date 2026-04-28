import express, { type Router } from "express";
import { requireAuth } from "../middlewares/authorization.js";
import { getMySubmissions } from "../controllers/profileController.js";


const profileRouter: Router = express.Router();

profileRouter.get('/profile/submissions', requireAuth, getMySubmissions);


export default profileRouter;