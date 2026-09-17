import winston,{Logger} from 'winston';

const isProduction: boolean = process.env.NODE_ENV === 'production';

export const logger : Logger= winston.createLogger({
    level: isProduction ? "info":"debug",
    format:winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack:true}),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta:{service:"comments-service"},
    transports:[
        new winston.transports.Console({
            format:winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({filename:"error.log",level:"error"}),
        new winston.transports.File({filename:"combined.log"})
    ]
})

