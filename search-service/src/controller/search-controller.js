const Search = require('../models/Search');
const Serach = require('../models/Search')
const logger = require('../utils/logger')

const searchPostController = async (req,res)=>{
    logger.info('Search endpoint hit!');

    try{
        const {query} = req.query;
        const result = await Search.find(
            {
            $text : {$search : query}
            },
            {
                $score : {$meta : 'textScore'}
            }
        ).sort({score : {$meta : 'textScore'}}).limit(10)
        res.json({
            results
        })
    }
    catch(err){
        logger.error("Error searching post",err);
        res.status(500).json({
            success:false,
            message:"Error fetching search by ID"
        })
    }
}

const getAllSearchPosts = async(req,res)=>{
    try{
        const allSearch = await Search.find()
        if(!allSearch){
            return res.status.json({
                success : false,
                message : "no search posts"
            })
            
        }
        res.json(allSearch)
    }catch(err){
        logger.error("Error getting all search post",err);
        res.status(500).json({
            success:false,
            message:"Error getting all search post"
        })
    }
}

module.exports = {searchPostController,getAllSearchPosts}