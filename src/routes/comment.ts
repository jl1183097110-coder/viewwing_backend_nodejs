import express, { type Router } from "express";
import {
  createComment,
  deleteComment,
  editComment,
  getPostComments,
} from "../controllers/commentController.js";
import { requireAuth } from "../middlewares/authorization.js";

const commentRouter: Router = express.Router();

commentRouter.get("/posts/:post_id/comments", getPostComments);
commentRouter.post("/comments", requireAuth, createComment);
commentRouter.put("/comments/:comment_id", requireAuth, editComment);
commentRouter.delete("/comments/:comment_id", requireAuth, deleteComment);

export default commentRouter;
