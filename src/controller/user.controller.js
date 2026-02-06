import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { request } from "express";

export async function getRecommendedUsers(res,req) {

    try {
        
//in this setion we gona have reccomended user form our database but be sure that our friends cant be in ur recommended list and also my profile cant be in recommended user 
        const currentUserId=req.user.id;
        const currentUser=req.user;    
        const recommendedUsers=await User.find({
            $and:[
              
                {_id:{$ne:currentUserId}},//exclude myself
                {_id:{$ne:currentUser.friends}},
                {isOnboard :true}//exclude myself  
            ]
    })
   res.status(200).json(recommendedUsers)
    } catch (error) {
        console.log("Error in getRecomendded controller",error.message);
       res.status(500).json({message:"internal server error"})
    }
}
export async function getMyFriend(res,req) {
    try {
        //now i am trying to have my friends baised on  id with thier 
        const user=await User.findById(req.user.id)
        .select("friends")
        .populate("friends","name profilePicture nativeLanguage learningLanguage")
        req.status(200).json(user.friends);
    } catch (error) {
        console.log("Error in getmyFriendController",error.message);
        res.status(500).json({message:"Internal Server Error"})
    }
}
export async function sendFriendRequest(req,res) {
    try {
         const myId=req.user.id;
         const {id:recipientId}=req.params
         //prevernt sending request to yourself 
         if(myId==recipientId) {
        return res.status(400).json({message:"you can tsend request to yourSelf"})
    }

    const recipient=await User.findById(recipientId)
    if(!recipient)
        return res.status(400).json({message:"Recipient not found"});

    //cheack if user is already a friend 
    if(recipient.friends.includes(myId)){
        return res.status(400).json({message:"you area already frined of that person"})
    }

    //cheack if a user is already exist 
    const existingRequest = await FriendRequest.findOne({
        $or: [
          { sender: myId, recipient: recipientId },
          { sender: recipientId, recipient: myId }
        ]
      });
      if(existingRequest){
        return  res
        .status(400)
        .json({message:"A friend request already  exist between we and user"});
      }

      const friendRequest= await FriendRequest.create({
        sender:myId,
        recipient:recipientId,
      });

      res.status(201).json(friendRequest)
    } catch (error) {
        return res.status(400).json({message:"Error in sending friend request"});

    }
}
export async function acceptFriendRequest(req,res) {
  try {
     const {id:requestId}=req.params
     const friendRequest=await FriendRequest.findbyId(requestId);
     

     if(!friendRequest){
        return res.status(404).json({message:"Friend Request Not found "});
     }
    //verify the user is recipent 
     if(friendRequest.recipient.toString()==req.user.id){
        return res.status(403).json({message:"you are not authorized to accept this request"});
     }
     friendRequest.status="accepted";
     await friendRequest.save();
     //ad each user to the other friends array 
     //addtoset is method if they are not in array 
     await User.findByIdAndUpdate(friendRequest.sender,{
        $addToSet:{friends:friendRequest.recipient},
     });

     await User.findByIdAndUpdate(friendRequest.recipient,{
        $addToSet:{friends:friendRequest.recipient},
     });
     
     return res.status(200).json({message:"frined request accepted"});

  } catch (error) {
    console.log("Error in accept friend request ",error.message);
    
    return res.status(500).json({message:"Internal Serevr Error"});
  }
}
export async function getFriendRequest(req,res){
    try {
        const incommingRequest=await FriendRequest.find({
            recipient:req.user.id,
            status:"pending",

        })  .populate("sender","name profilePicture nativeLanguage learningLanguage");

        const acceptReqs= await FriendRequest.find({
            sender:req.user.id,
            status:"accepted"
        }) .populate("recipient","name profilePicture");

        
        return res.status(200).json(incommingRequest,acceptReqs);
    } catch (error) {
        console.log("error in getpending friend request")
        
        return res.status(500).json({message:"Internal server error"});
    }
}
export async function getOutgoingFriendReqs(req,res){
    try {
        
        const outgoingRequests= await FriendRequest.find({
            sender:req.user.id,
            status:"pending"
        }) .populate("recipient","name profilePicture nativeLanguage learningLanguage");
       res.status(200).json(outgoingRequests)

    } catch (error) {
       console.log("Error in getOutgoingFriendReqs",error.message)
       res.status(500).json({message:"Internal Server Error"}); 
    }
}