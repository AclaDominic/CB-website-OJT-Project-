import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import { User, Users, Edit2, Check, X, Loader2 } from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { Navigate } from "react-router-dom";

const UserManager = () => {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (!user?.all_permissions?.includes("system.manage_users")) {
    return <Navigate to="/admin" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        axiosClient.get("/api/admin/users"),
        axiosClient.get("/api/admin/roles"),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    // Find user's current role name
    const currentRole =
      user.roles && user.roles.length > 0 ? user.roles[0].name : "";
    setSelectedRole(currentRole);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setSelectedRole("");
  };

  const handleSave = async () => {
    if (!selectedRole) return;

    try {
      await axiosClient.put(`/api/admin/users/${editingUser.id}`, {
        role: selectedRole,
      });
      fetchData();
      cancelEdit();
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-blue-600" /> User Management
          </h2>
          <p className="text-gray-500 text-sm">
            Assign roles and positions to system users.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned Role / Position
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.department?.name || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser && editingUser.id === user.id ? (
                    <select
                      className="block w-full p-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.roles &&
                        user.roles.length > 0 &&
                        user.roles[0].name === "Admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.roles && user.roles.length > 0
                        ? user.roles[0].name
                        : "No Role"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingUser && editingUser.id === user.id ? (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded"
                        title="Save"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 ml-auto"
                    >
                      <Edit2 size={16} /> Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManager;
