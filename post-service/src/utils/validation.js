const Joi = require('joi');

const validatePostCreation = (data)=>{
    const schema = Joi.object({
        content:Joi.string().min(3).max(5000).required(),
        mediaIds:Joi.array().items(Joi.string()).optional()
  
    })
    return schema.validate(data)
}



module.exports = {validatePostCreation};