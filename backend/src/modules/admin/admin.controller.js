const adminService = require("./admin.service");

exports.getStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// User CRUD
exports.getUsers = async (req, res, next) => {
  try {
    const filters = req.query;
    const users = await adminService.manageUsers(filters);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const userId = await adminService.createUser(req.body);
    res.status(201).json({ id: userId, message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const updated = await adminService.updateUser(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    await adminService.updateUserStatus(req.params.id, req.body.is_verified);
    res.json({ message: "User status updated" });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    next(error);
  }
};

// Company CRUD
exports.getCompanies = async (req, res, next) => {
  try {
    const filters = req.query;
    const companies = await adminService.getAllCompanies(filters);
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

exports.createCompany = async (req, res, next) => {
  try {
    const companyId = await adminService.createCompany(req.body);
    res.status(201).json({ id: companyId, message: "Company created successfully" });
  } catch (error) {
    next(error);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const updated = await adminService.updateCompany(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ message: "Company updated successfully" });
  } catch (error) {
    next(error);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    await adminService.deleteCompany(req.params.id);
    res.json({ message: "Company deleted" });
  } catch (error) {
    next(error);
  }
};

// Applications CRUD
exports.getApplications = async (req, res, next) => {
  try {
    const filters = req.query;
    const applications = await adminService.getAllApplications(filters);
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    await adminService.updateApplicationStatus(req.params.id, req.body.status);
    res.json({ message: "Application status updated" });
  } catch (error) {
    next(error);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    await adminService.deleteApplication(req.params.id);
    res.json({ message: "Application deleted" });
  } catch (error) {
    next(error);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const reports = await adminService.getReports();
    res.json(reports);
  } catch (error) {
    next(error);
  }
};

// Company Approval
exports.approveCompany = async (req, res, next) => {
  try {
    const companyId = req.params.id;
    const result = await adminService.updateCompanyStatus(companyId, 'approved');
    
    if (!result) {
      const error = new Error('Company not found or already approved');
      error.status = 404;
      throw error;
    }

    // 🔔 Notification: Notify company about approval
    try {
      const notificationHelper = require("../../services/notificationHelper");
      const companyInfo = await notificationHelper.getCompanyInfo(companyId);
      
      if (companyInfo && companyInfo.id_user) {
        await notificationHelper.notifyCompanyApproved(
          companyInfo.id_user,
          companyInfo.nom
        );
      }
    } catch (notifError) {
      console.error("⚠️ Notification error (non-blocking):", notifError.message);
      // Don't break the approval if notification fails
    }
    
    res.json({ message: "Company approved successfully" });
  } catch (error) {
    next(error);
  }
};

exports.rejectCompany = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const companyId = req.params.id;
    
    if (!reason || reason.trim() === '') {
      const error = new Error('Rejection reason is required');
      error.status = 400;
      throw error;
    }
    
    const result = await adminService.updateCompanyStatus(companyId, 'rejected', reason);
    
    if (!result) {
      const error = new Error('Company not found or already rejected');
      error.status = 404;
      throw error;
    }
    
    res.json({ message: "Company rejected successfully" });
  } catch (error) {
    next(error);
  }
};

// Job CRUD
exports.getJobs = async (req, res, next) => {
  try {
    const filters = req.query;
    const jobs = await adminService.getAllJobs(filters);
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

exports.getJobById = async (req, res, next) => {
  try {
    const job = await adminService.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json(job);
  } catch (error) {
    next(error);
  }
};

exports.approveJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const adminUserId = req.user?.id;
    
    const result = await adminService.approveJob(jobId, adminUserId);
    
    if (!result) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.json({ message: "Job approved successfully" });
  } catch (error) {
    next(error);
  }
};

exports.rejectJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const adminUserId = req.user?.id;
    
    const result = await adminService.rejectJob(jobId, adminUserId);
    
    if (!result) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.json({ message: "Job rejected successfully" });
  } catch (error) {
    next(error);
  }
};

exports.suspendJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const adminUserId = req.user?.id;
    
    const result = await adminService.suspendJob(jobId, adminUserId);
    
    if (!result) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    res.json({ message: "Job suspended successfully" });
  } catch (error) {
    next(error);
  }
};