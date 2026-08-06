const logger = require('logger');
const Post = require("../models/Post")

const createPost = async(req,res)=>{
    try{
        const {content,mediaIds}=req.body
        const newlyCreatedPost= new Post({
            user: req.user.userId,
            content,
            mediaIds:mediaIds || []
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