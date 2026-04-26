import React, { useState } from 'react';
import Sidebar from "../../components/common/Sidebar";
import Navbar from "../../components/common/Navbar";
import { useGetCompanyJobsQuery, useCreateJobMutation, useUpdateJobMutation, useDeleteJobMutation } from "../../store/api/jobApi";

function CompanyJobsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    salaire_min: '',
    salaire_max: '',
    secteur: '',
    localisation: '',
    type_contrat: 'CDI',
    niveau_experience: '',
    statut: 'ACTIF'
  });

  const { data: jobs, isLoading, isError, refetch } = useGetCompanyJobsQuery({
    search: searchTerm,
    status: statusFilter
  });
  const [deleteJob, { isLoading: isDeleting }] = useDeleteJobMutation();
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const [updateJob, { isLoading: isUpdating }] = useUpdateJobMutation();

  const jobsData = jobs || [];
  
  // Calculate stats
  const activeJobs = jobsData.filter((j: any) => j.statut === 'ACTIF').length;
  const draftJobs = jobsData.filter((j: any) => j.statut === 'FERME').length;
  const totalApplications = Math.floor(Math.random() * 5000); // Placeholder
  const avgTimeToFill = 21; // Placeholder

  const handleDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await deleteJob(id).unwrap();
        refetch();
        alert("Offre supprimée avec succès");
      } catch (err: any) {
        alert(err.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob(formData).unwrap();
      setShowCreateForm(false);
      resetForm();
      refetch();
      alert("Offre créée avec succès");
    } catch (err: any) {
      alert(err.data?.message || "Erreur lors de la création");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    try {
      await updateJob({ id: editingJob.id_offre, ...formData }).unwrap();
      setEditingJob(null);
      resetForm();
      refetch();
      alert("Offre mise à jour avec succès");
    } catch (err: any) {
      alert(err.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const startEdit = (job: any) => {
    setEditingJob(job);
    setFormData({
      titre: job.titre || '',
      description: job.description || '',
      salaire_min: job.salaire_min || '',
      salaire_max: job.salaire_max || '',
      secteur: job.secteur || '',
      localisation: job.localisation || '',
      type_contrat: job.type_contrat || 'CDI',
      niveau_experience: job.niveau_experience || '',
      statut: job.statut || 'ACTIF'
    });
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      salaire_min: '',
      salaire_max: '',
      secteur: '',
      localisation: '',
      type_contrat: 'CDI',
      niveau_experience: '',
      statut: 'ACTIF'
    });
  };

  const cancelEdit = () => {
    setEditingJob(null);
    setShowCreateForm(false);
    resetForm();
  };

  const filteredJobs = typeFilter 
    ? jobsData.filter((j: any) => j.type_contrat === typeFilter)
    : jobsData;

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar />
        <div className="content" style={{ padding: "30px" }}>
          {/* Header Section */}
          <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 8px 0", color: "#1a1a1a" }}>Jobs</h1>
              <p style={{ fontSize: "16px", color: "#666", margin: 0 }}>Manage your job postings and track applications</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => alert("Export feature coming soon")}
                style={{
                  padding: "10px 18px",
                  border: "1px solid #ccc",
                  background: "white",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#333"
                }}
              >
                📥 Export Jobs
              </button>
              <button
                onClick={() => {
                  setEditingJob(null);
                  setShowCreateForm(true);
                }}
                style={{
                  padding: "10px 18px",
                  background: "#5B67FF",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  fontWeight: "500"
                }}
              >
                ➕ Post New Job
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "30px"
          }}>
            <div style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start"
            }}>
              <div>
                <p style={{ color: "#666", fontSize: "14px", margin: "0 0 8px 0" }}>Active Jobs</p>
                <h3 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#1a1a1a" }}>{activeJobs}</h3>
                <p style={{ color: "#10b981", fontSize: "12px", margin: "8px 0 0 0", fontWeight: "500" }}>+3 this week</p>
              </div>
              <div style={{ fontSize: "32px" }}>📋</div>
            </div>

            <div style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start"
            }}>
              <div>
                <p style={{ color: "#666", fontSize: "14px", margin: "0 0 8px 0" }}>Total Applications</p>
                <h3 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#1a1a1a" }}>{totalApplications.toLocaleString()}</h3>
                <p style={{ color: "#10b981", fontSize: "12px", margin: "8px 0 0 0", fontWeight: "500" }}>+18% this month</p>
              </div>
              <div style={{ fontSize: "32px" }}>👥</div>
            </div>

            <div style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start"
            }}>
              <div>
                <p style={{ color: "#666", fontSize: "14px", margin: "0 0 8px 0" }}>Draft Jobs</p>
                <h3 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#1a1a1a" }}>{draftJobs}</h3>
                <p style={{ color: "#f59e0b", fontSize: "12px", margin: "8px 0 0 0", fontWeight: "500" }}>Ready to publish</p>
              </div>
              <div style={{ fontSize: "32px" }}>✏️</div>
            </div>

            <div style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start"
            }}>
              <div>
                <p style={{ color: "#666", fontSize: "14px", margin: "0 0 8px 0" }}>Avg. Time to Fill</p>
                <h3 style={{ fontSize: "28px", fontWeight: "700", margin: 0, color: "#1a1a1a" }}>{avgTimeToFill} days</h3>
                <p style={{ color: "#ef4444", fontSize: "12px", margin: "8px 0 0 0", fontWeight: "500" }}>-3 days improved</p>
              </div>
              <div style={{ fontSize: "32px" }}>⏱️</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{
            background: "white",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            marginBottom: "30px",
            display: "grid",
            gridTemplateColumns: "1fr auto auto",
            gap: "16px",
            alignItems: "end"
          }}>
            <div>
              <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px"
                }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                background: "white",
                cursor: "pointer"
              }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIF">Active</option>
              <option value="FERME">Closed</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: "10px 14px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                background: "white",
                cursor: "pointer"
              }}
            >
              <option value="">All Types</option>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="STAGE">Stage</option>
              <option value="FREELANCE">Freelance</option>
            </select>
          </div>

          {/* Create/Edit Form */}
          {(showCreateForm || editingJob) && (
            <div style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              marginBottom: "30px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
            }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginTop: 0, marginBottom: "20px" }}>
                {editingJob ? '✏️ Edit Job Posting' : '➕ Create New Job'}
              </h3>
              <form onSubmit={editingJob ? handleUpdate : handleCreate}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Title *</label>
                    <input
                      type="text"
                      value={formData.titre}
                      onChange={(e) => setFormData({...formData, titre: e.target.value})}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Sector *</label>
                    <input
                      type="text"
                      value={formData.secteur}
                      onChange={(e) => setFormData({...formData, secteur: e.target.value})}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                      placeholder="e.g., Engineering"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Location *</label>
                    <input
                      type="text"
                      value={formData.localisation}
                      onChange={(e) => setFormData({...formData, localisation: e.target.value})}
                      required
                      style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Contract Type</label>
                    <select
                      value={formData.type_contrat}
                      onChange={(e) => setFormData({...formData, type_contrat: e.target.value})}
                      style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="STAGE">Stage</option>
                      <option value="FREELANCE">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Min Salary</label>
                    <input
                      type="number"
                      value={formData.salaire_min}
                      onChange={(e) => setFormData({...formData, salaire_min: e.target.value})}
                      style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Max Salary</label>
                    <input
                      type="number"
                      value={formData.salaire_max}
                      onChange={(e) => setFormData({...formData, salaire_max: e.target.value})}
                      style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Experience Level</label>
                    <select
                      value={formData.niveau_experience}
                      onChange={(e) => setFormData({...formData, niveau_experience: e.target.value})}
                      style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    >
                      <option value="">Select</option>
                      <option value="JUNIOR">Junior</option>
                      <option value="INTERMEDIAIRE">Intermediate</option>
                      <option value="SENIOR">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Status</label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({...formData, statut: e.target.value})}
                      style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box" }}
                    >
                      <option value="ACTIF">Active</option>
                      <option value="FERME">Closed</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: "500", marginBottom: "6px" }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{ width: "100%", padding: "10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", boxSizing: "border-box", minHeight: "120px", fontFamily: "inherit" }}
                    placeholder="Job description..."
                  />
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    style={{
                      padding: "10px 20px",
                      background: "#5B67FF",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    {isCreating || isUpdating ? "Saving..." : editingJob ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={{
                      padding: "10px 20px",
                      background: "#f3f4f6",
                      color: "#333",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Jobs Table */}
          <div style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}>
            {isLoading && <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>Loading jobs...</p>}
            {isError && <p style={{ textAlign: "center", color: "#ef4444", padding: "40px 0" }}>Error loading jobs</p>}
            {filteredJobs.length === 0 && !isLoading && (
              <p style={{ textAlign: "center", color: "#999", padding: "40px 0" }}>No jobs found. Create one to get started!</p>
            )}
            {filteredJobs.length > 0 && (
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "14px"
                }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Job Title</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Company</th>
                      <th style={{ padding: "16px", textAlign: "left", fontWeight: "600", color: "#374151" }}>Salary</th>
                      <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", color: "#374151" }}>Applicants</th>
                      <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", color: "#374151" }}>Interviews</th>
                      <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", color: "#374151" }}>Status</th>
                      <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", color: "#374151" }}>Posted Date</th>
                      <th style={{ padding: "16px", textAlign: "center", fontWeight: "600", color: "#374151" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job: any, index: number) => (
                      <tr key={job.id_offre} style={{
                        borderBottom: "1px solid #e5e7eb",
                        background: index % 2 === 0 ? "white" : "#f9fafb",
                        transition: "background 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f3f4f6"}
                      onMouseLeave={(e) => e.currentTarget.style.background = index % 2 === 0 ? "white" : "#f9fafb"}
                      >
                        {/* Job Title */}
                        <td style={{ padding: "16px", color: "#1a1a1a", fontWeight: "600" }}>
                          {job.titre}
                        </td>
                        
                        {/* Company */}
                        <td style={{ padding: "16px", color: "#666" }}>
                          {job.secteur || "—"}
                        </td>
                        
                        {/* Salary */}
                        <td style={{ padding: "16px", color: "#1a1a1a", fontWeight: "500" }}>
                          {job.salaire_min && job.salaire_max 
                            ? `${job.salaire_min.toLocaleString()}-${job.salaire_max.toLocaleString()} DT` 
                            : "—"}
                        </td>
                        
                        {/* Applicants Count */}
                        <td style={{ padding: "16px", textAlign: "center", color: "#1a1a1a", fontWeight: "600" }}>
                          {Math.floor(Math.random() * 50)}
                        </td>
                        
                        {/* Interviews Count */}
                        <td style={{ padding: "16px", textAlign: "center", color: "#1a1a1a", fontWeight: "600" }}>
                          {Math.floor(Math.random() * 15)}
                        </td>
                        
                        {/* Status */}
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <span style={{
                            display: "inline-block",
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: job.statut === 'ACTIF' ? "#d1fae5" : "#fecaca",
                            color: job.statut === 'ACTIF' ? "#065f46" : "#7f1d1d"
                          }}>
                            {job.statut === 'ACTIF' ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        
                        {/* Posted Date */}
                        <td style={{ padding: "16px", textAlign: "center", color: "#666" }}>
                          {job.date_pub 
                            ? new Date(job.date_pub).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: '2-digit', 
                                day: '2-digit' 
                              })
                            : "Recently"}
                        </td>
                        
                        {/* Actions */}
                        <td style={{ padding: "16px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button
                              onClick={() => startEdit(job)}
                              title="Edit Job"
                              style={{
                                padding: "6px 12px",
                                background: "white",
                                color: "#5B67FF",
                                border: "1px solid #5B67FF",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "500",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#5B67FF";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "white";
                                e.currentTarget.style.color = "#5B67FF";
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(job.id_offre)}
                              disabled={isDeleting}
                              title="Delete Job"
                              style={{
                                padding: "6px 12px",
                                background: "#fee2e2",
                                color: "#ef4444",
                                border: "1px solid #fecaca",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "500",
                                transition: "all 0.2s",
                                opacity: isDeleting ? 0.6 : 1
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#ef4444";
                                e.currentTarget.style.color = "white";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#fee2e2";
                                e.currentTarget.style.color = "#ef4444";
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyJobsManagement;
