import express, { type Router } from "express";
import { requireAuth } from "../middlewares/authorization.js";
import { getPosts, getPostsById, createPost, updatePost, deletePost } from "../controllers/postController.js";


const postRouter: Router = express.Router();


postRouter.get('/posts', getPosts);
postRouter.get('/posts/:post_id', getPostsById);
postRouter.post('/posts', requireAuth, createPost);
postRouter.put('/posts/:post_id', requireAuth, updatePost);
postRouter.delete('/posts/:post_id', requireAuth, deletePost)



export default postRouter;
