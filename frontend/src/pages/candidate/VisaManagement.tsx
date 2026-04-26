import React, { useState } from 'react';
import Sidebar from "../../components/common/Sidebar";
import Navbar from "../../components/common/Navbar";
import { useGetVisaDocumentsQuery, useUploadVisaDocsMutation, useDeleteVisaDocMutation, useUpdateVisaStatusMutation } from "../../store/api/visaApi";

function CandidateVisaManagement() {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('PASSPORT');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: visaData, isLoading, isError, refetch } = useGetVisaDocumentsQuery({
    status: statusFilter
  });
  const [uploadDocs, { isLoading: isUploading }] = useUploadVisaDocsMutation();
  const [deleteDoc, { isLoading: isDeleting }] = useDeleteVisaDocMutation();
  const [updateStatus, { isLoading: isUpdating }] = useUpdateVisaStatusMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Veuillez sélectionner un fichier");
      return;
    }

    const formData = new FormData();
    formData.append("document", selectedFile);
    formData.append("type_document", documentType);

    try {
      await uploadDocs(formData).unwrap();
      setShowUploadForm(false);
      setSelectedFile(null);
      refetch();
      alert("Document téléchargé avec succès");
    } catch (err: any) {
      alert(err.data?.message || "Erreur lors du téléchargement");
    }
  };

  const handleDelete = async (docId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deleteDoc(docId).unwrap();
        refetch();
        alert("Document supprimé avec succès");
      } catch (err: any) {
        alert(err.data?.message || "Erreur lors de la suppression");
      }
    }
  };

  const handleStatusUpdate = async (visaId: number, status: string) => {
    try {
      await updateStatus({ id: visaId, status }).unwrap();
      refetch();
      alert("Statut mis à jour avec succès");
    } catch (err: any) {
      alert(err.data?.message || "Erreur lors de la mise à jour");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#d4edda';
      case 'REJECTED': return '#f8d7da';
      case 'PENDING': return '#fff3cd';
      case 'IN_PROGRESS': return '#cce5ff';
      default: return '#f8f9fa';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#155724';
      case 'REJECTED': return '#721c24';
      case 'PENDING': return '#856404';
      case 'IN_PROGRESS': return '#004085';
      default: return '#383d41';
    }
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Navbar />
        <div className="content">
          <div className="page-header">
            <h2>Gestion des Documents de Visa</h2>
            <p>Gérez vos documents d'immigration avec suivi complet</p>
          </div>

          {/* Filters */}
          <div style={{ marginTop: "20px", marginBottom: "20px", display: "flex", gap: "15px", alignItems: "center" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px" }}
            >
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="APPROVED">Approuvé</option>
              <option value="REJECTED">Rejeté</option>
            </select>
            <button
              onClick={() => setShowUploadForm(true)}
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              + Télécharger Document
            </button>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <div style={{
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginBottom: "20px"
            }}>
              <h3>Télécharger un Nouveau Document</h3>
              <form onSubmit={handleUpload}>
                <div style={{ display: "grid", gap: "15px", marginTop: "15px" }}>
                  <div>
                    <label>Type de Document:</label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                    >
                      <option value="PASSPORT">Passeport</option>
                      <option value="VISA">Visa</option>
                      <option value="BIRTH_CERTIFICATE">Certificat de Naissance</option>
                      <option value="POLICE_CERTIFICATE">Certificat de Police</option>
                      <option value="MEDICAL_REPORT">Rapport Médical</option>
                      <option value="COVER_LETTER">Lettre de Motivation</option>
                      <option value="EMPLOYMENT_LETTER">Lettre d'Emploi</option>
                      <option value="OTHER">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label>Fichier:</label>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      required
                      style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "4px" }}
                    />
                    <small style={{ color: "#666" }}>Formats acceptés: PDF, DOC, DOCX, JPG, PNG</small>
                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <button
                    type="submit"
                    disabled={isUploading || !selectedFile}
                    style={{
                      background: "#28a745",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginRight: "10px"
                    }}
                  >
                    {isUploading ? "Téléchargement..." : "Télécharger"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadForm(false);
                      setSelectedFile(null);
                    }}
                    style={{
                      background: "#6c757d",
                      color: "white",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Visa Documents Table */}
          <div className="visa-table-container" style={{ marginTop: "20px", background: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            {isLoading && <p>Chargement...</p>}
            {isError && <p>Erreur lors du chargement des documents</p>}

            {!isLoading && visaData && visaData.documents && visaData.documents.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #eee", textAlign: "left" }}>
                    <th style={{ padding: "10px" }}>ID</th>
                    <th style={{ padding: "10px" }}>Type de Document</th>
                    <th style={{ padding: "10px" }}>Statut Visa</th>
                    <th style={{ padding: "10px" }}>Date de Dépôt</th>
                    <th style={{ padding: "10px" }}>Date d'Expiration</th>
                    <th style={{ padding: "10px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visaData.documents.map((doc: any) => (
                    <tr key={doc.id_demande_visa} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "10px" }}>{doc.id_demande_visa}</td>
                      <td style={{ padding: "10px", fontWeight: "bold" }}>{doc.type_document}</td>
                      <td style={{ padding: "10px" }}>
                        <select
                          value={doc.statut}
                          onChange={(e) => handleStatusUpdate(doc.id_demande_visa, e.target.value)}
                          disabled={isUpdating}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                            backgroundColor: getStatusColor(doc.statut),
                            color: getStatusTextColor(doc.statut),
                            fontWeight: "bold",
                            cursor: "pointer"
                          }}
                        >
                          <option value="PENDING">En attente</option>
                          <option value="IN_PROGRESS">En cours</option>
                          <option value="APPROVED">Approuvé</option>
                          <option value="REJECTED">Rejeté</option>
                        </select>
                      </td>
                      <td style={{ padding: "10px" }}>
                        {new Date(doc.date_depot).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: "10px" }}>
                        {doc.date_expiration ? new Date(doc.date_expiration).toLocaleDateString('fr-FR') : 'N/A'}
                      </td>
                      <td style={{ padding: "10px" }}>
                        <button
                          onClick={() => handleDelete(doc.id_demande_visa)}
                          disabled={isDeleting}
                          style={{
                            background: "none",
                            border: "1px solid red",
                            color: "red",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.85rem"
                          }}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : !isLoading && (
              <p>Aucun document trouvé. Téléchargez votre premier document en cliquant sur "+ Télécharger Document".</p>
            )}
          </div>

          {/* Summary Stats */}
          {visaData && (
            <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "15px" }}>
              <div style={{ padding: "15px", background: "#cce5ff", borderRadius: "4px", textAlign: "center" }}>
                <h4>Total Documents</h4>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{visaData.documents?.length || 0}</p>
              </div>
              <div style={{ padding: "15px", background: "#fff3cd", borderRadius: "4px", textAlign: "center" }}>
                <h4>En Attente</h4>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{visaData.documents?.filter((d: any) => d.statut === 'PENDING')?.length || 0}</p>
              </div>
              <div style={{ padding: "15px", background: "#d4edda", borderRadius: "4px", textAlign: "center" }}>
                <h4>Approuvés</h4>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{visaData.documents?.filter((d: any) => d.statut === 'APPROVED')?.length || 0}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CandidateVisaManagement;