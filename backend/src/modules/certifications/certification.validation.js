const Joi = require("joi");

const certificationSchema = Joi.object({
  date_obtient: Joi.date().required(),
  university: Joi.string().required(),
  competence: Joi.string().required(),
  id_user: Joi.number().integer().required()
});

module.exports = {
  certificationSchema
};