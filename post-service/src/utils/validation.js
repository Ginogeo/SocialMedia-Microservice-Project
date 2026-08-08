const Joi = require('joi');

const validatePostCreation = (data)=>{
    const schema = Joi.object({
        content:Joi.string().min(3).max(5000).required(),
        mediaIds:Joi.Array()
    })
    return schema.validate(data)
}



module.exports = {validatePostCreation};