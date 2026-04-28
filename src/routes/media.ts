import express, { type Router } from "express";
import { requireAuth } from "../middlewares/authorization.js";
import { getPresign, addMediaToPost, deleteMedia } from "../controllers/mediaController.js";


const mediaRouter: Router = express.Router();

mediaRouter.post('/media/presign', requireAuth, getPresign);
mediaRouter.post('/posts/:post_id/media', requireAuth, addMediaToPost)
mediaRouter.delete('/posts/:post_id/media/:media_id', requireAuth, deleteMedia)



export default mediaRouter;





