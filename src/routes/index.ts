import { Router } from "express";
import authRouter from "./auth.js";
import regionRouter from "./regions.js";
import locationRouter from "./locations.js";
import spotsRouter from "./spots.js";
import postRouter from "./post.js";
import mediaRouter from "./media.js";
import commentRouter from "./comment.js";
import favouritesRouter from "./favourites.js";
import profileRouter from "./profile.js";



const router = Router();
router.use("/api", regionRouter);
router.use("/api", authRouter);
router.use("/api", locationRouter);
router.use("/api", spotsRouter);
router.use("/api", postRouter);
router.use("/api", mediaRouter);
router.use("/api", commentRouter);
router.use("/api", favouritesRouter);
router.use("/api", profileRouter);




export default router;
