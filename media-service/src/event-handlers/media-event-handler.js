const logger = require('../utils/logger');
const Media = require('../models/Media');
const {deleteFromCloudinary}= require('../utils/cloudinary')

const handlePostDeleted = async(event)=>{
    console.log("Media deletion event happened")
    const {postId,mediaIds}=event;
    try{
        const mediaToDelete=await Media.find({_id : {$in:mediaIds}});
        for (const media of mediaToDelete){
            await deleteFromCloudinary(media.publicId);
            await Media.findByIdAndDelete(media._id);
            logger.info(`Deleted media ${media._id} associated with post ${postId}`)   
        }
        logger.info(`Processed deletion of media for post: ${postId}`)
    }
    catch(err){
        logger.error("Error occured while media deletion: ",err)
    }
    

}

module.exports={handlePostDeleted}