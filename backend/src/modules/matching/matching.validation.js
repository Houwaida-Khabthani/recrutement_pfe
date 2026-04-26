const Joi = require("joi");

const matchingSchema = Joi.object({
  score: Joi.number().integer().min(0).max(100).required(),
  note: Joi.number().integer().min(0).max(100),
  id_candidature: Joi.number().integer().required(),
  id_offre: Joi.number().integer().required()
});

module.exports = {
  matchingSchema
};