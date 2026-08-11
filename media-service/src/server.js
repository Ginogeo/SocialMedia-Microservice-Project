require("dotenv").config()
const express=require('express')
const mongoose = require('mongoose');
const helmet = require('helmet')
const cors = require('cors');
const Redis = require("ioredis")
const mediaRoutes = require("./routes/media-routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const {connectDB,connectRedis} = require("./database/db")
const {rateLimit}= require('express-rate-limit')
const{RedisStore}=require('rate-limit-redis');
const { consumeEvents , connectRabbitMQ} = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./event-handlers/media-event-handler");


connectDB()
redisClient = connectRedis()

const app=express();
const PORT = process.env.PORT || 3002


app.use(cors());
app.use(helmet());
app.use(express.json());
app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`),
    logger.info(`Request body : ${req.body}`);
    next();
})

const sensitiveEndpointsLimiter = rateLimit({
    windowMs : 15 * 60 * 1000,
    max: 50,
    standardHeaders : true,
    legacyHeaders : false,
    handler : (req,res)=>{
        logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}` )
        res.status(429).json({
            success:false,
            message:"Too many requests"
        })
    },
    store: new RedisStore({
        sendCommand : (...args)=>redisClient.call(...args)
    })
})

app.use('/api/media',sensitiveEndpointsLimiter,(req,res,next)=>{
    req.redisClient = redisClient;
    next()
},mediaRoutes)

app.use(errorHandler)




async function startServer(){
    try{
        await connectRabbitMQ();

        await consumeEvents("post.deleted",handlePostDeleted)

        app.listen(PORT,()=>{
            logger.info(`media-service running on port: ${PORT}`)
        })
    }
    catch(err){
        logger.error('Failed to connect to server',err)
        process.exit(1)
    }
}

startServer()

process.on('unhandledRejection',(reason,promise)=>{
    logger.error(`Unhandled rejection at `,promise , 'reason: ',reason)
})
