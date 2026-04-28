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

// Document management controllers
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const fileData = {
      type_document: req.body.type_document,
      nom_fichier: req.file.originalname,
      chemin_fichier: req.file.filename,
      taille_fichier: req.file.size,
      id_demande_visa: req.body.id_demande_visa || null
    };

    const documentId = await visaService.uploadDocument(req.user.id, fileData);
    res.status(201).json({
      id: documentId,
      message: "Document téléchargé avec succès"
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserDocuments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const documents = await visaService.getUserDocuments(req.user.id, status);
    res.json({
      documents,
      total: documents.length
    });
  } catch (error) {
    next(error);
  }
};

exports.updateDocumentStatus = async (req, res, next) => {
  try {
    const { status, commentaire_admin } = req.body;
    const success = await visaService.updateDocumentStatus(req.params.id, status, commentaire_admin);

    if (!success) {
      return res.status(404).json({ message: "Document non trouvé" });
    }

    res.json({ message: "Statut du document mis à jour" });
  } catch (error) {
    next(error);
  }
};

exports.deleteDocument = async (req, res, next) => {
  try {
    const success = await visaService.deleteDocument(req.params.id);

    if (!success) {
      return res.status(404).json({ message: "Document non trouvé" });
    }

    res.json({ message: "Document supprimé avec succès" });
  } catch (error) {
    next(error);
  }
};