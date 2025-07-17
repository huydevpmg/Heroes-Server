import { Router } from "express";
import ReactionController from "../controllers/reaction.controller.js";
import { protectRoute } from "../middleware/socketAuth.js";

const reactionController = new ReactionController();

const router = Router();
router.use(protectRoute);
router.post("/add", reactionController.addReaction);
router.post("/remove",reactionController.removeReaction);
router.get("/:messageId", reactionController.getReactions);

export default router;