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

exports.documentUploadSchema = Joi.object({
  type_document: Joi.string().valid(
    'PASSPORT', 'VISA', 'BIRTH_CERTIFICATE', 'POLICE_CERTIFICATE',
    'MEDICAL_REPORT', 'COVER_LETTER', 'EMPLOYMENT_LETTER', 'OTHER'
  ).required(),
  id_demande_visa: Joi.number().integer().allow(null)
});

exports.documentStatusUpdateSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').required(),
  commentaire_admin: Joi.string().allow('', null)
});

exports.documentUploadSchema = Joi.object({
  type_document: Joi.string().valid(
    'PASSPORT', 'VISA', 'BIRTH_CERTIFICATE', 'POLICE_CERTIFICATE',
    'MEDICAL_REPORT', 'COVER_LETTER', 'EMPLOYMENT_LETTER', 'OTHER'
  ).required(),
  id_demande_visa: Joi.number().integer().allow(null)
});

exports.documentStatusUpdateSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED').required(),
  commentaire_admin: Joi.string().allow('', null)
});