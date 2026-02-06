import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { upsertStreamUser } from '../models/stream.js';
dotenv.config();

export async function signup(req, res) {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const emailregex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.match(emailregex)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists. Please use another email.' });
    }

    const idx = Math.floor(Math.random() * 1) + 1;
    const randomavatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      name,
      email,
      password,
      profilePicture: randomavatar,
      nativeLanguage: 'English',
      learningLanguage: 'None',

    });
    try {
      await upsertStreamUser({
        id:newUser._id.toString(),
        name:newUser.name,
        image:newUser.profilePicture,
      })
  console.log(`Stream User is created for ${newUser.name}`)  
    } catch (error) {
      console.log("Eror creating a Stream user",error)
    }


    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: '7d',
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });

    return res.status(201).json({ success: true, user: newUser });

  } catch (error) {
    console.log("Error in signup controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const user = await User.findOne({ email }); // ✅ findOne instead of find
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const isPasswordCorrect = await user.matchPassword(password)// ✅ method on user
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: '7d',
      });
  
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: 'strict',
      });
  
      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.log("Error in login controller:", error.message || error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
export function logout(req, res) {
    res.clearCookie("jwt")
    return res.status(200).json({ success: true, message:"logout Successfuly"});
}
export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { name, bio, learningLanguage, nativeLanguage, location } = req.body;

    const missingFields = [];
    if (!name) missingFields.push("name");
    if (!learningLanguage) missingFields.push("learningLanguage");
    if (!nativeLanguage) missingFields.push("nativeLanguage");
    if (!location) missingFields.push("location");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields,
      });
    }

    const updateObj = {
      name,
      learningLanguage,
      nativeLanguage,
      location,
      isOnboard: true,
    };
    if (bio !== undefined) updateObj.bio = bio;

    const updateUser = await User.findByIdAndUpdate(userId, updateObj, { new: true });

if(!updateUser)
   return res.status(200).json({ success: true, message:"logout Successfuly"});

    try {
      await upsertStreamUser({
        id:updateUser._id.toString(),
        name:updateUser.name,
        image:updateUser.profilePicture,
      })
   console.log(`Stream user updated after onboarding for ${updateUser.name}`)  
    } catch (streamError) {
      console.log("Error updating stream during onboarding ",streamError.message)
    }


//updated user in stream 
   res.status(200).json({success:true,user:updateUser});

  } catch (error) {
     console.error("Onboarding error",error);
     res.status(500).json({message:"Internal Server Error"});
    };
  
}