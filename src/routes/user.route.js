import  express from "express";
import { protecteRoute } from "../middleware/auth.middleware.js";
import { acceptFriendRequest, getFriendRequest, getMyFriend, getOutgoingFriendReqs, getRecommendedUsers, sendFriendRequest } from "../controller/user.controller.js";

const router=express.Router();
router.use (protecteRoute);

router.get("/",getRecommendedUsers)
router.get("/friends",getMyFriend)
router.post("/friends-request/:id",sendFriendRequest);
router.put("/friends-request/:id/accept",acceptFriendRequest);
router.get("/friends-request/:id/accept",getFriendRequest);
router.get("/outgoing-friend-request/:id/request",getOutgoingFriendReqs);


export default router;