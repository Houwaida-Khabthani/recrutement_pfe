import React, { useState } from 'react';
import {
  Building2, Plus, Search, Edit2, Trash2, X, AlertCircle,
  Mail, User, Globe, Sparkles
} from 'lucide-react';
import Sidebar from "../../components/common/Sidebar";
import Navbar from "../../components/common/Navbar";
import { useGetAllCompaniesQuery, useDeleteCompanyMutation, useCreateCompanyMutation, useUpdateCompanyMutation } from "../../store/api/adminApi";

function AdminCompanies() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    email: '',
    secteur: '',
    id_user: ''
  });

  const { data: companies, isLoading, isError, refetch } = useGetAllCompaniesQuery({
    search: searchTerm
  });
  const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyMutation();
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation();
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation();

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteCompany(id).unwrap();
        refetch();
        alert("Company deleted successfully");
      } catch (err: any) {
        alert(err.data?.message || "Error deleting company");
      }
    }
  };

  const openForm = (company?: any) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        nom: company.nom || '',
        description: company.description || '',
        email: company.email || '',
        secteur: company.secteur || '',
        id_user: company.id_user || ''
      });
    } else {
      setEditingCompany(null);
      setFormData({
        nom: '',
        description: '',
        email: '',
        secteur: '',
        id_user: ''
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCompany(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await updateCompany({ id: editingCompany.id_company, ...formData }).unwrap();
        alert("Company updated successfully");
      } else {
        await createCompany(formData).unwrap();
        alert("Company created successfully");
      }
      closeForm();
      refetch();
    } catch (err: any) {
      alert(err.data?.message || "Error saving company");
    }
  };

  return (
    <>
      <Sidebar />
      <Navbar />

      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Company Management
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              Manage Companies 🏢
            </h1>
            <p className="text-slate-500 font-medium text-base">
              Create, edit, and link companies to user accounts
            </p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 w-fit"
          >
            <Plus className="w-5 h-5" />
            Add Company
          </button>
        </div>

        {/* ── Search ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company name..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            />
          </div>
        </div>

        {/* ── Companies Table ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading && (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading companies...</p>
            </div>
          )}

          {isError && (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <p className="text-rose-600 font-medium">Error loading companies</p>
            </div>
          )}

          {!isLoading && companies?.length === 0 && (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No companies found</p>
            </div>
          )}

          {!isLoading && companies && companies.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Company</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Email</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Industry</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Linked User</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {companies.map((company: any) => (
                    <tr key={company.id_company} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                            {company.nom?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{company.nom}</p>
                            <p className="text-xs text-slate-400">{company.description || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {company.email ? (
                          <a href={`mailto:${company.email}`} className="text-indigo-600 hover:underline font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4" /> {company.email}
                          </a>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {company.secteur ? (
                          <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg">
                            {company.secteur}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                        {company.user_name ? (
                          <>
                            <User className="w-4 h-4 text-slate-400" />
                            {company.user_name}
                          </>
                        ) : (
                          <span className="text-slate-400">Not linked</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openForm(company)}
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(company.id_company)}
                            disabled={isDeleting}
                            className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </main>

      {/* ── Modal for Create/Edit Company ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {editingCompany ? '✏️ Edit Company' : '➕ Create New Company'}
              </h3>
              <button onClick={closeForm} className="p-1 hover:bg-white/20 rounded-lg transition">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                  <input
                    type="text"
                    value={formData.secteur}
                    onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                {/* User ID */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Link User ID (optional)</label>
                  <input
                    type="number"
                    value={formData.id_user}
                    onChange={(e) => setFormData({ ...formData, id_user: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    placeholder="Link to existing user"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition resize-none"
                    rows={4}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2"
                >
                  {isCreating || isUpdating ? 'Saving...' : (editingCompany ? '💾 Update' : '✨ Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminCompanies;