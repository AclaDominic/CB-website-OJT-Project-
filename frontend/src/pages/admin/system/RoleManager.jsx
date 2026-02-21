import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import { Plus, Trash2, Edit2, Shield, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { Navigate } from "react-router-dom";
import PageLoader from "../../../components/PageLoader";

/**
 * RoleManager Component
 * Allows admins to manage Roles and assign Permissions.
 */
const RoleManager = () => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Form State
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [error, setError] = useState("");

  if (authLoading) {
    return <PageLoader />;
  }

  if (!user?.all_permissions?.includes("system.manage_roles")) {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        axiosClient.get("/api/admin/roles"),
        axiosClient.get("/api/admin/permissions"),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (role = null) => {
    setError("");
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      // Pre-select existing permissions
      setSelectedPermissions(role.permissions.map((p) => p.name));
    } else {
      setEditingRole(null);
      setRoleName("");
      setSelectedPermissions([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setRoleName("");
    setSelectedPermissions([]);
  };

  const handlePermissionToggle = (permName) => {
    if (selectedPermissions.includes(permName)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== permName));
    } else {
      setSelectedPermissions([...selectedPermissions, permName]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      setError("Role name is required");
      return;
    }

    const payload = {
      name: roleName,
      permissions: selectedPermissions,
    };

    try {
      if (editingRole) {
        await axiosClient.put(`/api/admin/roles/${editingRole.id}`, payload);
      } else {
        await axiosClient.post("/api/admin/roles", payload);
      }
      fetchData();
      closeModal();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("An error occurred while saving the role.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await axiosClient.delete(`/api/admin/roles/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  // Group permissions for better UI
  const groupedPermissions = permissions.reduce((acc, perm) => {
    const [group] = perm.name.split(".");
    if (!acc[group]) acc[group] = [];
    acc[group].push(perm);
    return acc;
  }, {});

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-blue-600" /> Role & Permission Manager
          </h2>
          <p className="text-gray-500 text-sm">
            Manage user roles and their access privileges.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-sm"
        >
          <Plus size={20} /> Create New Role
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white p-5 rounded-lg shadow border border-gray-100 flex flex-col hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-lg text-gray-800">{role.name}</h4>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {role.permissions?.length || 0} Permissions
              </span>
            </div>

            <div className="flex-1 mb-4">
              <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Access Highlights
              </h5>
              <div className="flex flex-wrap gap-1">
                {role.permissions?.slice(0, 5).map((p) => (
                  <span
                    key={p.id}
                    className="text-xs border border-gray-200 px-2 py-1 rounded text-gray-600"
                  >
                    {p.name}
                  </span>
                ))}
                {role.permissions?.length > 5 && (
                  <span className="text-xs text-gray-400 px-1 py-1">
                    +{role.permissions.length - 5} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-gray-100">
              <button
                onClick={() => openModal(role)}
                className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors"
                title="Edit Role"
              >
                <Edit2 size={18} />
              </button>
              {role.name !== "Admin" && ( // Prevent deleting Super Admin
                <button
                  onClick={() => handleDelete(role.id)}
                  className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                  title="Delete Role"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingRole ? "Edit Role" : "Create New Role"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="roleForm" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
                    {error}
                  </div>
                )}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g., Site Supervisor"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="space-y-4">
                    {Object.entries(groupedPermissions).map(
                      ([group, perms]) => (
                        <div
                          key={group}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <h4 className="font-bold text-sm text-gray-700 capitalize mb-3 border-b pb-2">
                            {group} Management
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {perms.map((perm) => (
                              <label
                                key={perm.id}
                                className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors"
                              >
                                <div className="relative flex items-center">
                                  <input
                                    type="checkbox"
                                    className="peer appearance-none h-5 w-5 border border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 transition-all"
                                    checked={selectedPermissions.includes(
                                      perm.name,
                                    )}
                                    onChange={() =>
                                      handlePermissionToggle(perm.name)
                                    }
                                  />
                                  <Check
                                    className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transform peer-checked:scale-100 scale-50 transition-all"
                                    size={12}
                                    strokeWidth={4}
                                  />
                                </div>
                                <span className="text-sm text-gray-600">
                                  {perm.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-lg">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="roleForm"
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
