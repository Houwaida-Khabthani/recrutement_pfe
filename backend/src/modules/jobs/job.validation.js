const Joi = require("joi");

exports.jobSchema = Joi.object({
  titre: Joi.string().min(5).max(150).required(),
  type_contrat: Joi.string().required(),
  localisation: Joi.string().required(),
  description: Joi.string().min(20).required(),
  // Accept number OR string-coercible number, or null/empty
  salaire: Joi.alternatives().try(
    Joi.number().positive(),
    Joi.string().allow('', null)
  ).allow(null).optional(),
  experience: Joi.string().max(50).allow(null, '').optional(),
  date_expiration: Joi.date().iso().allow(null, '').optional(),
  statut: Joi.string().max(50).allow(null, '').optional(),
});