const Post = require("../models/Post")
const logger = require("../utils/logger");
const { publishEvent } = require("../utils/rabbitmq");
const {validatePostCreation}=require("../utils/validation")

async function invalidatePostCache (req,input){
    const keys = await req.redisClient.keys("posts:*");
    if(keys.length>0){
        await req.redisClient.del(keys)
    }
    if(input){
        await req.redisClient.del(input);
    }
}

const createPost = async(req,res)=>{
    try{
        logger.info("create-post endpoint hit")
        const {error}=validatePostCreation(req.body)
        if(error){
            logger.warn(`validation error: ${error.details[0].message}`)
            return res.status(400).json({
                success:false,
                message:error.details[0].message
            })
        }
        const {content,mediaIds}=req.body;
        
        const newlyCreatedPost= new Post({
            user: req.user.userId,
            content,
            mediaIds:mediaIds || []
        })

        await newlyCreatedPost.save();

        await publishEvent('post.created', {
            postId : newlyCreatedPost._id.toString(),
            userId : newlyCreatedPost.user.toString(),
            content : newlyCreatedPost.content,
            createdAt : newlyCreatedPost.createdAt
        })

        await invalidatePostCache(req,newlyCreatedPost._id.toString())
        
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page-1) *limit;

        const cacheKey = `posts:${page}:${limit}`;
        const cachedPosts = await req.redisClient.get(cacheKey);
        if(cachedPosts){
            return res.json(JSON.parse(cachedPosts))
        }

        const posts= await Post.find({})
            .sort({createdAt:-1})
            .skip(startIndex)
            .limit(limit);
        
        const totalNoOfPosts = await Post.countDocuments();

        const result = {
            posts,
            currentPage : page,
            totalPages : Math.ceil(totalNoOfPosts/limit),
            totalPosts : totalNoOfPosts
        }

        //save posts in redis cache

        await req.redisClient.setex(cacheKey,300,JSON.stringify(result));

        res.json(result);
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
        const postId = req.params.id;
        const cacheKey = `post:${postId}`;
        const cachedPost = await req.redisClient.get(cacheKey);
        if(cachedPost){
            return res.json(JSON.parse(cachedPost))
        }

        const singlePost = await Post.findById(postId);
        if(!singlePost){
            return res.status(404).json({
                success:false,
                message:"post not found"
            })
        }

        await req.redisClient.setex(cacheKey,3600,JSON.stringify(singlePost))
        res.json(singlePost);
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
        const postId = req.params.id
        
        const post = await Post.findOneAndDelete({
            _id : postId,
            user:req.user.userId
        });

        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post not found"
            })
        }
        const cacheKey=`post:${postId}`

        //publish post deletion event
        await publishEvent('post.deleted',{
            postId:post._id.toString(),
            userId:req.user.userId,
            mediaIds:post.mediaIds
        }
        )

        invalidatePostCache(req,cacheKey)
        res.status(200).json({
            success:true,
            message: "post deleted successfully"
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

module.exports={createPost,getAllPost,getPost,deletePost}