const amqp = require('amqplib');
const logger = require('./logger');

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events'

async function connectRabbitMQ(){
    while (!connection || !channel) {
        try {
            if (!connection) {
                logger.info("Attempting to connect to RabbitMQ...");
                connection = await amqp.connect(process.env.RABBITMQ_URL);
                
                // Optional: Handle connection drops after a successful connect
                connection.on('error', (err) => logger.error('RabbitMQ connection error', err));
                connection.on('close', () => logger.warn('RabbitMQ connection closed'));
            }

            if (!channel) {
                logger.info("Creating RabbitMQ channel...");
                channel = await connection.createChannel();
            }
            
        } catch (error) {
            logger.error("RabbitMQ setup failed. Retrying in 10 seconds...", error);
            
            // Clean up connection state if channel creation failed
            if (connection && !channel) {
                try { await connection.close(); } catch (_) {}
                connection = null;
            }
            
            // Wait 10 seconds before trying again
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    try {
        // 3. Configure topology once connection and channel are solid
        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
        logger.info("Successfully connected to RabbitMQ and asserted exchange");
        return channel;
    } catch (topologyError) {
        logger.error("Failed to assert exchange topology:", topologyError);
        throw topologyError; 
    }
}

async function publishEvent(routingKey,message){
    if(!channel){
        await connectRabbitMQ()
    }
    channel.publish(EXCHANGE_NAME,routingKey,Buffer.from(JSON.stringify(message)));
    logger.info(`Event published: ${routingKey}`)
}

async function consumeEvents(routingKey,callback) {
    if(!channel){
        await connectRabbitMQ()
    }
    const q = await channel.assertQueue("",{exclusive:true});
    await channel.bindQueue(q.queue,EXCHANGE_NAME,routingKey);
    channel.consume(q.queue,(msg)=>{
        if(!msg) return;

        const content = JSON.parse(msg.content.toString());
        callback(content);
        channel.ack(msg)
    })
    logger.info(`Subscribed to event: ${routingKey}`)
}

module.exports={connectRabbitMQ,publishEvent,consumeEvents}