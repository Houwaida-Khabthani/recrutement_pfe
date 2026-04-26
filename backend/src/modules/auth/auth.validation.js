const Joi = require('joi');

exports.registerSchema = Joi.object({
  role: Joi.string().valid('CANDIDAT', 'ENTREPRISE', 'ADMIN').required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nom: Joi.string().allow('', null),
  nom_entreprise: Joi.string().allow('', null),
  telephone: Joi.string().allow('', null),
  pays: Joi.string().allow('', null),
  adresse: Joi.string().allow('', null),
  civilite: Joi.string().valid('Mr', 'Mme', 'Mlle').allow('', null),
  date_naissance: Joi.date().allow('', null),
  description_entreprise: Joi.string().allow('', null),
  identifiant_entreprise: Joi.string().allow('', null),
  secteur: Joi.string().allow('', null),
  site_web: Joi.string().uri().allow('', null),
  logo: Joi.string().allow('', null)
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});