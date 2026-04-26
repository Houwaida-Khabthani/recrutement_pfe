const Joi = require("joi");

exports.visaRequestSchema = Joi.object({
  type_visa: Joi.string().required(),
  date_debut: Joi.date().required(),
  date_fin: Joi.date().greater(Joi.ref('date_debut')).required()
});

exports.visaStatusUpdateSchema = Joi.object({
  statut: Joi.string().valid('EN_ATTENTE', 'APPROUVEE', 'REFUSEE').required(),
  commentaire_admin: Joi.string().allow('', null)
});