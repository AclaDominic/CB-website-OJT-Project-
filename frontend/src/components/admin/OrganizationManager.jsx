import React, { useState, useEffect } from "react";
import axiosClient from "../../lib/axios";
import { Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import ImagePicker from "../ImagePicker";

const OrganizationManager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "staff",
    image: null,
    order: 0,
  });
  const [imagePreview, setImagePreview] = useState(null); // For existing image preview
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/organization-members");
      setMembers(response.data);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      category: "staff",
      image: null,
      order: 0,
    });
    setImagePreview(null);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      role: member.role,
      category: member.category,
      image: null, // Don't set image initially, only if changed
      order: member.order,
    });
    setImagePreview(member.image_path);
    setEditingId(member.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;

    try {
      await axiosClient.delete(`/api/organization-members/${id}`);
      setMembers(members.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Failed to delete member");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validation
    const orderVal = parseInt(formData.order);
    if (orderVal < 0) {
      alert("Order cannot be negative.");
      setSaving(false);
      return;
    }

    // Check for duplicates in the same category
    // Exclude the current member being edited (if any)
    const isDuplicate = members.some(
      (m) =>
        m.category === formData.category &&
        m.order === orderVal &&
        m.id !== editingId,
    );

    if (isDuplicate) {
      alert(
        `Order number ${orderVal} is already used in the ${formData.category} category.`,
      );
      setSaving(false);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("role", formData.role);
    data.append("category", formData.category);
    data.append("order", formData.order);

    if (formData.image instanceof File) {
      data.append("image", formData.image);
    }

    try {
      if (editingId) {
        data.append("_method", "PUT"); // For Laravel method spoofing
        const response = await axiosClient.post(
          `/api/organization-members/${editingId}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        // Optimistic update or refetch
        fetchMembers();
      } else {
        const response = await axiosClient.post(
          "/api/organization-members",
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        setMembers([...members, response.data]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving member:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Failed to save member");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (fileData) => {
    if (fileData.type === "file" && fileData.value instanceof File) {
      setFormData({ ...formData, image: fileData.value });
    }
  };

  const groupedMembers = {
    Leading: members.filter((m) => m.category === "leadership"),
    Management: members.filter((m) => m.category === "management"),
    Staff: members.filter((m) => m.category === "staff"),
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          Organizational Structure
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            <Plus size={18} /> Add Member
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                className="w-full p-2 border rounded"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="leadership">Leadership (Top Level)</option>
                <option value="management">Management (Mid Level)</option>
                <option value="staff">Staff / Operations (Bottom Level)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order (Sort Priority - Lower is first)
              </label>
              <input
                type="number"
                className="w-full p-2 border rounded"
                value={formData.order}
                onChange={(e) =>
                  setFormData({ ...formData, order: parseInt(e.target.value) })
                }
              />
            </div>
          </div>

          <div className="mb-4">
            <ImagePicker
              label="Profile Photo"
              defaultImage={imagePreview}
              onImageChanged={handleImageChange}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {editingId ? "Update Member" : "Save Member"}
            </button>
          </div>
        </form>
      )}

      {/* List Members */}
      <div className="space-y-6">
        {Object.entries(groupedMembers).map(([category, group]) => (
          <div key={category}>
            <h4 className="font-semibold text-gray-600 bg-gray-100 p-2 rounded mb-3 capitalize">
              {category}
            </h4>
            {group.length === 0 ? (
              <p className="text-gray-400 italic text-sm ml-2">
                No members in this category.
              </p>
            ) : (
              <div className="grid gap-4">
                {group
                  .sort((a, b) => a.order - b.order)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex justify-between items-center p-4 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        {member.image_path ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || "http://localhost:8000"}${member.image_path}`}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h5 className="font-bold text-gray-800">
                            {member.name}
                          </h5>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <span className="text-xs text-gray-400">
                            Order: {member.order}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrganizationManager;
