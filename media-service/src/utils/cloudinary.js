const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');
const logger = require('./logger')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const onResult = (error, result) => {
            if (error) {
                logger.error('Cloudinary upload failed', error)
                return reject(error)
            }
            logger.info('Cloudinary upload succeeded:')
            resolve(result)
        }

        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, onResult)
        
        uploadStream.end(file.buffer)
    })
}

const deleteFromCloudinary = async (publicId)=>{
    try{
        const result = await cloudinary.uploader.destroy(publicId);
        logger.info(`Media deleted successfuly from cloud stroage: ${publicId}`);
        return result;
    }
    catch(err){
        logger.error('Error while deleting media from cloudinary: ',err);
        throw err;
    }
}

module.exports = {uploadToCloudinary,deleteFromCloudinary}