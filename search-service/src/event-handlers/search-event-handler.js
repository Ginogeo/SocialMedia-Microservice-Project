const logger = require('../utils/logger');
const Search = require('../models/Search');

async function handlePostCreated(event){
    try{
        const newSearchPost = new Search({
            postId : event.postId,
            userId : event.userId,
            content : event.content,
            createdAt : event.createdAt
        })

        await newSearchPost.save()
        logger.info(`Search post created: ${event.postId}. ${newSearchPost._id.toString()}`)
    }
    catch(err){
        logger.error("Error occured while handling create post event: ",err)
    }
}

module.exports = {handlePostCreated}
