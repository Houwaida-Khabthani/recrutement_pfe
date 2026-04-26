const Certification = require("./certification.model");

exports.getAllCertifications = async (req, res, next) => {
  try {
    const filters = req.query;
    const certifications = await Certification.findAll(filters);
    res.json(certifications);
  } catch (error) {
    next(error);
  }
};

exports.getCertificationById = async (req, res, next) => {
  try {
    const certification = await Certification.findById(req.params.id);
    if (!certification) {
      return res.status(404).json({ message: "Certification not found" });
    }
    res.json(certification);
  } catch (error) {
    next(error);
  }
};

exports.createCertification = async (req, res, next) => {
  try {
    const certificationId = await Certification.create(req.body);
    res.status(201).json({ id: certificationId, message: "Certification created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateCertification = async (req, res, next) => {
  try {
    const updated = await Certification.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Certification not found" });
    }
    res.json({ message: "Certification updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteCertification = async (req, res, next) => {
  try {
    const deleted = await Certification.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Certification not found" });
    }
    res.json({ message: "Certification deleted successfully" });
  } catch (error) {
    next(error);
  }
};