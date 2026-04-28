import express, { type Router } from "express";
import { login, register, profile, updateProfile, logout } from "../controllers/authController.js";
import { requireAuth } from "../middlewares/authorization.js";


const authRouter: Router = express.Router();


authRouter.route('/auth/register').post(register);
authRouter.route('/auth/login').post(login);
authRouter.get('/auth/me',requireAuth ,profile);
authRouter.put('/auth/profile',requireAuth ,updateProfile);
authRouter.post('/auth/logout',requireAuth ,logout);


export default authRouter;





