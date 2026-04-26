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