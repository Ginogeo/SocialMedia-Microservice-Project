const logger = require('../utils/logger')
const User = require('../models/User')
const {validateRegistration, validateLogin}=require('../utils/validation')
const generateTokens= require('../utils/generateToken')
const RefreshToken= require('../models/RefreshToken')


const registerUser = async (req,res)=>{
    logger.info('registration endpoint hit...');
    try{
        const {error}=validateRegistration(req.body);
        if(error){
            logger.warn(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }
        const {email,password,username}=req.body;
        let user = await User.findOne({$or : [{email},{username}]});
        if(user){
            logger.warn("User already exists");
            return res.status(400).json({
                success:false,
                message:"User already exists"
            })
        }
        user = new User({username,email,password})
        await user.save()
        logger.warn("User saved successfullty:",user._id);
        const {accessToken,refreshToken}=await generateTokens(user)
        res.status(201).json({
            success : true,
            message:'User registered successfully',
            accessToken,
            refreshToken
        })
    }
    catch(err){
        logger.error('Registration error occured:',err);
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

const loginUser = async(req,res)=>{
    logger.info("Login endpoint hit ");
    try{
        const {error}= validateLogin(req.body);
        if(error){
            logger.warn(`Validation error: ${error.details[0].message}`);
            return res.status(400).json({
                success: false,
                message : error.details[0].message
            })
        }

        const {email , password} = req.body
        const user = await User.findOne({email});

        if(!user){
            logger.warn("Invalid user!")
            return res.status(400).json({
                success: false,
                message : "Invalid credentials"
            })
        }

        const isPasswordValid = await user.comparePassword(password);
        if(! isPasswordValid){
            logger.warn("Invalid password");
            return res.status(400).json({
                success: false,
                message : "Invalid password"
            })
        }

        const {accessToken,refreshToken}= await generateTokens(user);

        res.status(200).json({
            accessToken,
            refreshToken,
            userId : user._id
        })
    }
    catch(err){
        logger.error('Login error occured:',err);
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

const refreshTokenUser= async (req,res)=>{
    logger.info("Refresh token endpoint hit!");
    try{
        const {refreshToken} = req.body
        if(!refreshToken){
            logger.warn("No refresh token found");
            return res.status(400).json({
                success : false,
                message : "Refresh token not found!"
            })
        }

        const storedToken = await RefreshToken.findOne({token:refreshToken})

        
        if(!storedToken){
            logger.warn("Invalid refresh token provided");
            return res.status(400).json({
                success: false,
                message: "Invalid refresh token",
            });
        }

        if(storedToken.expiresAt<new Date()){
            logger.warn("Invalid or expired refresh token")
            return res.status(401).json({
                success: false,
                message: `Invalid or expired refresh token`,
            });
        }

        const user= await User.findById(storedToken.user)

        if (!user) {
            logger.warn("User not found");

            return res.status(401).json({
                success: false,
                message: `User not found`,
            });
        }

        await RefreshToken.deleteOne({ _id: storedToken._id });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateTokens(user);

        //delete the old refresh token
        

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        });
    }
    catch(err){
        logger.error('Refresh Token error occured:',err);
        res.status(500).json({
            success:false,
            message:'Internal server error'
        })
    }
}

const logoutUser = async (req, res) => {
    logger.info("Logout endpoint hit...");

    try{
        const { refreshToken } = req.body;
        if (!refreshToken) {
            logger.warn("Refresh token missing");
            return res.status(400).json({
                success: false,
                message: "Refresh token missing",
            });
        }

        const storedToken = await RefreshToken.findOneAndDelete({token: refreshToken,});
        if (!storedToken) {
            logger.warn("Invalid refresh token provided");
            return res.status(400).json({
                success: false,
                message: "Invalid refresh token",
            });
        }
        logger.info("Refresh token deleted for logout");

        res.json({
            success: true,
            message: "Logged out successfully!",
        });
    } 
    catch (e){
    logger.error("Error while logging out", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {registerUser,loginUser,refreshTokenUser,logoutUser}