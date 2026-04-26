const Joi = require('joi');

exports.updateProfileSchema = Joi.object({
  nom: Joi.string().min(2),
  telephone: Joi.string().allow('', null),
  specialite: Joi.string().allow('', null),
  experience: Joi.string().allow('', null),
  niveau_etude: Joi.string().allow('', null),
  civilite: Joi.string().valid('Mr', 'Mme', 'Mlle').allow('', null),
  date_naissance: Joi.date().allow('', null),
  adresse: Joi.string().allow('', null),
  pays: Joi.string().allow('', null),
  bio: Joi.string().allow('', null),
  linkedin: Joi.string().uri().allow('', null),
  github: Joi.string().uri().allow('', null),
  portfolio: Joi.string().uri().allow('', null),
  // File names handled after upload
  cv: Joi.string().allow('', null),
  logo: Joi.string().allow('', null),
  avatar: Joi.string().allow('', null)
});