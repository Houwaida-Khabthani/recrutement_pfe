const Visa = require("./visa.model");

exports.requestVisa = async (userId, data) => {
  return await Visa.createDemande({ ...data, id_user: userId });
};

exports.getUserVisaRequests = async (userId) => {
  return await Visa.findDemandesByUser(userId);
};

exports.getAllRequestsForAdmin = async () => {
  return await Visa.findAllDemandes();
};

exports.processRequest = async (id, status, comment) => {
  const success = await Visa.updateStatus(id, status, comment);
  
  if (success && status === 'APPROUVEE') {
    // Optionally create a formal visa record if approved
    // This could be automated or managed separately
  }
  
  return success;
};

exports.issueVisa = async (data) => {
  return await Visa.createVisaRecord(data);
};

// Document management services
exports.uploadDocument = async (userId, fileData) => {
  const documentData = {
    id_user: userId,
    ...fileData
  };
  return await Visa.createDocument(documentData);
};

exports.getUserDocuments = async (userId, status = null) => {
  return await Visa.getDocumentsByUser(userId, status);
};

exports.updateDocumentStatus = async (docId, status, comment = null) => {
  return await Visa.updateDocumentStatus(docId, status, comment);
};

exports.deleteDocument = async (docId) => {
  // Get document info first to potentially delete file from filesystem
  const document = await Visa.getDocumentById(docId);
  if (!document) {
    throw new Error("Document not found");
  }

  // Delete from database
  const deleted = await Visa.deleteDocument(docId);
  if (deleted) {
    // TODO: Delete physical file from uploads directory
    // const fs = require('fs');
    // const path = require('path');
    // const filePath = path.join(__dirname, '../../uploads', document.chemin_fichier);
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    // }
  }

  return deleted;
};