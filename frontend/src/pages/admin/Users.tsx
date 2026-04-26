import React, { useState } from 'react';
import {
  Users, Plus, Search, Filter, Edit2, Trash2, X, AlertCircle,
  Mail, Phone, Globe, Sparkles
} from 'lucide-react';
import { useGetAllUsersQuery, useDeleteUserMutation, useCreateUserMutation, useUpdateUserMutation } from "../../store/api/adminApi";
import { UserRole } from "../../types/roles";

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    mot_de_passe: '',
    role: UserRole.CANDIDAT,
    telephone: '',
    pays: 'Tunisia',
    adresse: '',
    civilite: 'Mr'
  });

  const { data: users, isLoading, isError, refetch } = useGetAllUsersQuery({
    search: searchTerm,
    role: roleFilter
  });
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(id).unwrap();
        refetch();
        alert("User deleted successfully");
      } catch (err: any) {
        alert(err.data?.message || "Error deleting user");
      }
    }
  };

  const openForm = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nom: user.nom || '',
        email: user.email || '',
        mot_de_passe: '',
        role: user.role || UserRole.CANDIDAT,
        telephone: user.telephone || '',
        pays: user.pays || 'Tunisia',
        adresse: user.adresse || '',
        civilite: user.civilite || 'Mr'
      });
    } else {
      setEditingUser(null);
      setFormData({
        nom: '',
        email: '',
        mot_de_passe: '',
        role: UserRole.CANDIDAT,
        telephone: '',
        pays: 'Tunisia',
        adresse: '',
        civilite: 'Mr'
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser({ id: editingUser.id_user, ...formData }).unwrap();
        alert("User updated successfully");
      } else {
        await createUser(formData).unwrap();
        alert("User created successfully");
      }
      closeForm();
      refetch();
    } catch (err: any) {
      alert(err.data?.message || "Error saving user");
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
      [UserRole.ADMIN]: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
      [UserRole.ENTREPRISE]: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Company' },
      [UserRole.CANDIDAT]: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Candidate' }
    };
    const config = roleConfig[role] || { bg: 'bg-slate-100', text: 'text-slate-700', label: role };
    return config;
  };

  return (
    <>
      

      <main className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[4px] mb-1 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> User Management
            </p>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
              Manage Users & Roles 👥
            </h1>
            <p className="text-slate-500 font-medium text-base">
              Add, edit, and manage user accounts with role assignment
            </p>
          </div>
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 w-fit"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* ── Search & Filters ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer bg-white"
              >
                <option value="">All Roles</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.ENTREPRISE}>Company</option>
                <option value={UserRole.CANDIDAT}>Candidate</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Users Table ── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading && (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-slate-500 font-medium">Loading users...</p>
            </div>
          )}

          {isError && (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <p className="text-rose-600 font-medium">Error loading users</p>
            </div>
          )}

          {!isLoading && users?.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No users found</p>
            </div>
          )}

          {!isLoading && users && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">User</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Email</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Role</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Phone</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-500 uppercase tracking-widest text-xs">Country</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-500 uppercase tracking-widest text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user: any) => {
                    const roleBadge = getRoleBadge(user.role);
                    return (
                      <tr key={user.id_user} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                              {user.nom?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{user.nom}</p>
                              <p className="text-xs text-slate-400">{user.civilite}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a href={`mailto:${user.email}`} className="text-indigo-600 hover:underline font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4" /> {user.email}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${roleBadge.bg} ${roleBadge.text}`}>
                            {roleBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex items-center gap-2">
                            {user.telephone ? (
                              <>
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span>{user.telephone}</span>
                              </>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="flex items-center gap-2">
                            {user.pays ? (
                              <>
                                <Globe className="w-4 h-4 text-slate-400" />
                                <span>{user.pays}</span>
                              </>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openForm(user)}
                              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id_user)}
                              disabled={isDeleting}
                              className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-600 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ── Modal for Create/Edit User ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {editingUser ? '✏️ Edit User' : '➕ Create New User'}
              </h3>
              <button onClick={closeForm} className="p-1 hover:bg-white/20 rounded-lg transition">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
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
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    required
                  />
                </div>

                {/* Password (only for creation) */}
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Password *</label>
                    <input
                      type="password"
                      value={formData.mot_de_passe}
                      onChange={(e) => setFormData({ ...formData, mot_de_passe: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                      required={!editingUser}
                    />
                  </div>
                )}

                {/* Role */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value={UserRole.CANDIDAT}>Candidate</option>
                    <option value={UserRole.ENTREPRISE}>Company</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={formData.pays}
                    onChange={(e) => setFormData({ ...formData, pays: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                  <select
                    value={formData.civilite}
                    onChange={(e) => setFormData({ ...formData, civilite: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none cursor-pointer"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Ms">Ms</option>
                    <option value="Mrs">Mrs</option>
                  </select>
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
                  {isCreating || isUpdating ? 'Saving...' : (editingUser ? '💾 Update' : '✨ Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminUsers;
