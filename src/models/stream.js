import {StreamChat} from "stream-chat"
import "dotenv/config"


const apikey=process.env.STREAM_API_KEY;
const apiSecrete=process.env.STREAM_API_SECRET

if(!apikey || !apiSecrete){
    console.error("Stram Api key or API Secrete key is missing");
}
const streamClient=StreamChat.getInstance(apikey,apiSecrete);


export const upsertStreamUser = async (userData) => {
    try {
      if (!userData.id) {
        throw new Error("User ID is required");
      }
  
      await streamClient.upsertUser(userData);
      return userData;
    } catch (error) {
      console.error("Error upserting Stream user:", error.message);
    }
  };
  
export const generateStreamToken=(userId)=>{
  try {
    //ensure user id 
    const userIdStr= userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.log("Error generating the stream token")
  }
};
