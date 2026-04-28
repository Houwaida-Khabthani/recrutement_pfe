import React, { useState } from 'react';
import { Download, Upload, Trash2, CheckCircle, Clock, AlertCircle, Eye, FileText } from 'lucide-react';
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
      alert("Document uploaded successfully");
    } catch (err: any) {
      alert(err.data?.message || "Error during upload");
    }
  };

  const handleDelete = async (docId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await deleteDoc(docId).unwrap();
        refetch();
        alert("Document deleted successfully");
      } catch (err: any) {
        alert(err.data?.message || "Error during deletion");
      }
    }
  };

  const handleStatusUpdate = async (docId: number, status: string) => {
    try {
      await updateStatus({ id: docId, status }).unwrap();
      refetch();
      alert("Status updated successfully");
    } catch (err: any) {
      alert(err.data?.message || "Error during update");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'REJECTED':
        return <span className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-lg"><AlertCircle className="w-3 h-3" /> Rejected</span>;
      case 'PENDING':
        return <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg"><Clock className="w-3 h-3" /> Pending</span>;
      default:
        return <span className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg"><Eye className="w-3 h-3" /> {status}</span>;
    }
  };

  const documents = visaData?.documents || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl">
      {/* Header */}
      <div>
      <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
          <FileText className="w-3.5 h-3.5" /> Documents
        </p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Visa Document Management</h1>
        <p className="text-slate-400 font-medium text-base mt-1">Upload and manage your immigration documents to facilitate your mobility.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold mb-2 uppercase">Total Documents</p>
          <p className="text-3xl font-black text-slate-900">{documents.length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold mb-2 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</p>
          <p className="text-3xl font-black text-amber-600">{documents.filter((d: any) => d.statut === 'PENDING').length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold mb-2 uppercase flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</p>
          <p className="text-3xl font-black text-emerald-600">{documents.filter((d: any) => d.statut === 'APPROVED').length}</p>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-slate-400 text-xs font-bold mb-2 uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Rejected</p>
          <p className="text-3xl font-black text-red-600">{documents.filter((d: any) => d.statut === 'REJECTED').length}</p>
        </div>
      </div>

      {/* Upload button and filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-black rounded-xl text-sm uppercase tracking-widest hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-lg"
        >
          <Upload className="w-4 h-4" /> Upload Document
        </button>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold text-sm focus:outline-none focus:border-indigo-400"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Upload New Document</h2>
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-900 mb-2">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:outline-none focus:border-indigo-400"
              >
                <option value="PASSPORT">Passport</option>
                <option value="VISA">Visa</option>
                <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                <option value="POLICE_CERTIFICATE">Police Certificate</option>
                <option value="MEDICAL_REPORT">Medical Report</option>
                <option value="COVER_LETTER">Cover Letter</option>
                <option value="EMPLOYMENT_LETTER">Employment Letter</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-slate-900 mb-2">Select a File</label>
              <input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-700 font-bold focus:outline-none focus:border-indigo-400"
              />
              <p className="text-xs text-slate-400 font-bold mt-2">Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)</p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-black rounded-xl text-sm uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Upload className="w-4 h-4" /> {isUploading ? "Uploading..." : "Upload"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                }}
                className="px-6 py-3 bg-slate-200 text-slate-700 font-black rounded-xl text-sm uppercase tracking-widest hover:bg-slate-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">My Documents</h3>
          <p className="text-slate-400 text-xs font-bold">Uploaded immigration documents</p>
        </div>

        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-4">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-400 font-black text-lg">No documents</p>
            <p className="text-slate-300 text-sm">Click "Upload Document" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-widest">File</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-600 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-center text-xs font-black text-slate-600 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-black text-slate-600 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc: any) => (
                  <tr key={doc.id_document} className="hover:bg-slate-50 transition-all">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-lg uppercase">
                        {doc.type_document}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{doc.nom_fichier}</p>
                      <p className="text-slate-400 text-xs">{(doc.taille_fichier / 1024).toFixed(2)} KB</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-600 font-bold text-sm">
                        {new Date(doc.date_upload).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(doc.statut)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(doc.id_document)}
                        disabled={isDeleting}
                        className="flex items-center gap-1 ml-auto px-4 py-2.5 bg-red-50 text-red-600 font-black rounded-lg text-xs uppercase tracking-widest hover:bg-red-100 disabled:opacity-50 transition-all"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateVisaManagement;