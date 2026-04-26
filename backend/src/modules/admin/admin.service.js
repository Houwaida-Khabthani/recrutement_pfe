const Admin = require("./admin.model");

exports.getDashboardStats = async () => {
  return await Admin.getStats();
};

exports.manageUsers = async (filters = {}) => {
  return await Admin.getAllUsers(filters);
};

exports.createUser = async (data) => {
  return await Admin.createUser(data);
};

exports.updateUser = async (id, data) => {
  return await Admin.updateUser(id, data);
};

exports.updateUserStatus = async (id, status) => {
  return await Admin.verifyUser(id, status);
};

exports.deleteUser = async (id) => {
  return await Admin.deleteUser(id);
};

// Company CRUD
exports.getAllCompanies = async (filters = {}) => {
  return await Admin.getAllCompanies(filters);
};

exports.createCompany = async (data) => {
  return await Admin.createCompany(data);
};

exports.updateCompany = async (id, data) => {
  return await Admin.updateCompany(id, data);
};

exports.deleteCompany = async (id) => {
  return await Admin.deleteCompany(id);
};

exports.updateCompanyStatus = async (id, status, reason = null) => {
  try {
    console.log(`[ADMIN SERVICE] Updating company ${id} status to ${status}`, { reason });
    const result = await Admin.updateCompanyStatus(id, status, reason);
    console.log(`[ADMIN SERVICE] Update result:`, result);
    return result;
  } catch (error) {
    console.error(`[ADMIN SERVICE] Error updating company status:`, error.message);
    throw error;
  }
};

// Applications CRUD
exports.getAllApplications = async (filters = {}) => {
  return await Admin.getAllApplications(filters);
};

exports.updateApplicationStatus = async (id, status) => {
  return await Admin.updateApplicationStatus(id, status);
};

exports.deleteApplication = async (id) => {
  return await Admin.deleteApplication(id);
};

exports.getReports = async () => {
  return await Admin.getReports();
};

// Job CRUD
exports.getAllJobs = async (filters = {}) => {
  return await Admin.getAllJobs(filters);
};

exports.getJobById = async (id) => {
  return await Admin.getJobById(id);
};

exports.approveJob = async (id, adminUserId = null) => {
  return await Admin.updateJobStatus(id, 'approved', adminUserId);
};

exports.rejectJob = async (id, adminUserId = null) => {
  return await Admin.updateJobStatus(id, 'rejected', adminUserId);
};

exports.suspendJob = async (id, adminUserId = null) => {
  return await Admin.updateJobStatus(id, 'suspended', adminUserId);
};