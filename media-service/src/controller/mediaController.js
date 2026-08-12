const logger = require('../utils/logger');
const {uploadToCloudinary,deleteFromCloudinary} = require('../utils/cloudinary')
const Media = require('../models/Media');

const uploadMedia = async(req,res)=>{
    logger.info('Starting media upload')
    try{
        if(!req.file){
            logger.error('No file found. Please try after addin a file');
            return res.status(400).json({
                success:false,
                message:'No file foumd . Please try after addin a file'
            })
        }
        const {originalname,mimetype,buffer}=req.file;
        const userId = req.user.userId;

        logger.info(`File details: name= ${originalname}, type= ${mimetype}`);
         
        const cloudinaryUploadResult = await uploadToCloudinary(req.file);
        logger.info(`Cloudienary upload successfull. Public Id: ${cloudinaryUploadResult.public_id}`);
        const newlyCreatedMedia = new Media({
            publicId: cloudinaryUploadResult.public_id,
            originalName:originalname,
            mimeType:mimetype,
            url : cloudinaryUploadResult.secure_url,
            userId
        })
        await newlyCreatedMedia.save()
        res.status(201).json({
            success:true,
            meidaId : newlyCreatedMedia._id,
            url:newlyCreatedMedia.url,
            message : 'Media uploaded successfully'
        })
    }
    catch(err){
        logger.error("Error uploading media: ",err);
        res.status(500).json({
            success:false,
            message:"Error uploading media"
        })
    }
}


const getAllMedia=async(req,res)=>{
    try{
        const result = await Media.find({});
        res.json({result});
    }
    catch(err){
        logger.error("Error fetching media: ",err);
        res.status(500).json({
            success:false,
            message:"Error fetching media"
        })
    }
}

const deleteMedia = async(req,res)=>{
    try{

        const mediaId=req.params.id
        const media = await Media.findOneAndDelete({
            _id:mediaId
        });
        if(!media){
            return res.status(404).json({
                success:false,
                message:"Post not found"
            })
        }
        res.status(200).json({
            success:true,
            message: "media deleted successfully"
        })

    }
    catch(err){
        logger.error("Error deleting media: ",err);
        res.status(500).json({
            success:false,
            message:"Error deleting media"
        })
    }
}

module.exports= {uploadMedia,getAllMedia,deleteMedia}