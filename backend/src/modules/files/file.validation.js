const Joi = require("joi");

const fileSchema = Joi.object({
  nom: Joi.string().required(),
  type: Joi.string().required(),
  url: Joi.string().required(),
  id_entreprise: Joi.number().integer().required()
});

module.exports = {
  fileSchema
};