const visaService = require("./visa.service");

exports.requestVisa = async (req, res, next) => {
  try {
    const requestId = await visaService.requestVisa(req.user.id, req.body);
    res.status(201).json({ id: requestId, message: "Demande de visa envoyée" });
  } catch (error) {
    next(error);
  }
};

exports.getMyVisaRequests = async (req, res, next) => {
  try {
    const requests = await visaService.getUserVisaRequests(req.user.id);
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

exports.getAllVisaRequestsAdmin = async (req, res, next) => {
  try {
    const requests = await visaService.getAllRequestsForAdmin();
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

exports.updateVisaStatusAdmin = async (req, res, next) => {
  try {
    const { statut, commentaire_admin } = req.body;
    await visaService.processRequest(req.params.id, statut, commentaire_admin);
    res.json({ message: "Demande de visa mise à jour" });
  } catch (error) {
    next(error);
  }
};