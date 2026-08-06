require('dotenv').config()
const express=require('express')
const mongoose = require('mongoose');
const {connectDB,connectRedis}= require('./database/db')
const logger = require('./utils/logger')
const helmet = require('helmet')
const cors = require('cors');
const {RateLimiterRedis}=require('rate-limiter-flexible');
const {rateLimit}= require('express-rate-limit')
const{RedisStore}=require('rate-limit-redis')
const routes = require('./routes/identity-services')
const errorHandler = require('./middleware/errorHandler')

connectDB()
const redisClient=connectRedis()

const app = express();

const PORT = process.env.PORT || 3001

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use((req,res,next)=>{
    logger.info(`Recived ${req.method} request to ${req.url}`),
    logger.info(`Request body : ${req.body}`);
    next();
})

const rateLimiter = new RateLimiterRedis({
    storeClient : redisClient,
    keyPrefix : 'middleware',
    points : 10,
    duration : 1
})

app.use((req,res,next)=>{
    rateLimiter
    .consume(req.ip)
    .then(()=>next())
    .catch(()=>{
        logger.warn(`Rage limit exceeded for IP : ${req.ip}`)
        res.status(429).json({
            success : false,
            message : 'Too many requests'
        })
    })
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

app.use('/api/auth/register',sensitiveEndpointsLimiter)

app.use('/api/auth',routes)

app.use(errorHandler)

app.listen(PORT, ()=>{logger.info(`Identity service running on port: ${PORT}`)})

process.on('unhandledRejection',(reason,promise)=>{
    logger.error(`Unhandled rejection at `,promise , 'reason: ',reason)
})