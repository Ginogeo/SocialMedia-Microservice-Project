const Post = require("../models/Post")
const logger = require("../utils/logger");

const createPost = async(req,res)=>{
    try{
        logger.info("create-post endpoint hit")
        const {content,mediaIds}=req.body
        if(!content || !mediaIds){
            return res.status(400).json({
                success:false,
                message:"no details provided"
            })
        }
        const newlyCreatedPost= new Post({
            user: req.user.userId,
            content,
            mediaIds:mediaIds || []
        })

        await newlyCreatedPost.save();
        logger.info("Post created successfully!")
        res.status(201).json({
            success:true,
            message :'Post created successfully'
        })
    }
    catch(err){
        logger.error("Error fetching post",err);
        res.status(500).json({
            success:false,
            message:"Error fetching post by ID"
        })
    }
}


const getAllPost = async(req,res)=>{
    try{
        
    }
    catch(err){
        logger.error("Error fetching post",err);
        res.status(500).json({
            success:false,
            message:"Error fetching post by ID"
        })
    }
}


const getPost = async(req,res)=>{
    try{
        
    }
    catch(err){
        logger.error("Error fetching post",err);
        res.status(500).json({
            success:false,
            message:"Error fetching post by ID"
        })
    }
}


const deletePost = async(req,res)=>{
    try{
        
    }
    catch(err){
        logger.error("Error fetching post",err);
        res.status(500).json({
            success:false,
            message:"Error fetching post by ID"
        })
    }
}

module.exports={createPost}