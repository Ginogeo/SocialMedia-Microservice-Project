const mongoose = require('mongoose');
const logger = require('../utils/logger');
const Redis = require('ioredis')
const connectDB = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("Connection to MongoDB successfully!");
    }
    catch(err){
        logger.error("MongoDB connection error:", err);
        process.exit()
    }

}

const connectRedis =  ()=>{
    try{
        const redisClient = new Redis(process.env.REDIS_URL)
        return redisClient;
    }
    catch(err){
        logger.error("Redis connection errorr:", err)
    }
}

module.exports = {connectDB,connectRedis}
