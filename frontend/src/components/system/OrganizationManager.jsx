import React, { useState, useEffect } from "react";
import axiosClient from "../../lib/axios";
import { Plus, Edit, Trash2, Save, X, Loader2 } from "lucide-react";
import ImagePicker from "../ImagePicker";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "./ConfirmModal";

const OrganizationManager = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    category: "staff",
    parent_id: "",
    image: null,
    order: 0,
  });
  const [imagePreview, setImagePreview] = useState(null); // For existing image preview
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const [showProfile, setShowProfile] = useState(false);
  const [toggleSaving, setToggleSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    action: null,
  });

  useEffect(() => {
    fetchMembers();
    fetchShowProfileSetting();
  }, []);

  const fetchShowProfileSetting = async () => {
    try {
      const response = await axiosClient.get(
        "/api/page-contents?page=organization&section=settings",
      );
      const setting = response.data.find((s) => s.section_name === "settings");
      if (setting) {
        // Since sqlite returns 1/0 for true/false sometimes, ensure strict boolean
        setShowProfile(
          Boolean(setting.show_profile || setting.show_profile === 1),
        );
      }
    } catch (error) {
      console.error("Error fetching show profile setting:", error);
    }
  };

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
      parent_id: "",
      image: null,
      order: 0,
    });
    setImagePreview(null);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleToggleShowProfile = async () => {
    if (!user?.all_permissions?.includes("cms.edit")) return;

    setToggleSaving(true);
    const newValue = !showProfile;

    try {
      await axiosClient.post("/api/page-contents", {
        page_name: "organization",
        section_name: "settings",
        content: "{}", // Empty content, we only care about show_profile
        show_profile: newValue,
      });
      setShowProfile(newValue);
      toast.success(
        `Organization Chart profile images ${newValue ? "enabled" : "disabled"}`,
      );
    } catch (error) {
      console.error("Error saving show profile setting:", error);
      toast.error("Failed to update display setting");
    } finally {
      setToggleSaving(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      role: member.role,
      category: member.category,
      parent_id: member.parent_id || "",
      image: null, // Don't set image initially, only if changed
      order: member.order,
    });
    setImagePreview(member.image_path);
    setEditingId(member.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this member?",
      action: async () => {
        try {
          await axiosClient.delete(`/api/organization-members/${id}`);
          setMembers(members.filter((m) => m.id !== id));
          toast.success("Member deleted successfully");
        } catch (error) {
          console.error("Error deleting member:", error);
          toast.error("Failed to delete member");
        }
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Validation
    const orderVal = parseInt(formData.order);
    if (orderVal < 0) {
      toast.error("Order cannot be negative.");
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
      toast.error(
        `Order number ${orderVal} is already used in the ${formData.category} category.`,
      );
      setSaving(false);
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("role", formData.role);
    data.append("category", formData.category);

    // Only append if it has a value, otherwise send an empty string which Laravel converts to null
    if (formData.parent_id) {
      data.append("parent_id", formData.parent_id);
    } else {
      data.append("parent_id", "");
    }

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
        toast.success("Member updated successfully");
      } else {
        const response = await axiosClient.post(
          "/api/organization-members",
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        setMembers([...members, response.data]);
        toast.success("Member added successfully");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving member:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("Failed to save member");
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Organizational Structure
          </h3>

          {/* Toggle Switch */}
          {!isAdding && user?.all_permissions?.includes("cms.edit") && (
            <div className="flex items-center gap-3 mt-3 ml-1">
              <label
                htmlFor="show-profile-toggle"
                className="inline-flex items-center cursor-pointer"
              >
                <div className="relative">
                  <input
                    id="show-profile-toggle"
                    type="checkbox"
                    className="sr-only"
                    checked={showProfile}
                    onChange={handleToggleShowProfile}
                    disabled={toggleSaving}
                  />
                  <div
                    className={`block w-10 h-6 rounded-full transition-colors ${showProfile ? "bg-blue-500" : "bg-gray-300"}`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showProfile ? "transform translate-x-4" : ""}`}
                  ></div>
                </div>
                <div className="ml-3 text-sm font-medium text-gray-700 flex items-center gap-2">
                  Show Profile
                  {toggleSaving && (
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                  )}
                </div>
              </label>
            </div>
          )}
        </div>

        {!isAdding && user?.all_permissions?.includes("cms.edit") && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition h-fit"
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reports To (Manager / Supervisor)
            </label>
            <select
              className="w-full p-2 border rounded"
              value={formData.parent_id}
              onChange={(e) =>
                setFormData({ ...formData, parent_id: e.target.value })
              }
            >
              <option value="">-- None (Top Level) --</option>
              {members
                .filter((m) => m.id !== editingId) // Prevent selecting self
                .sort((a, b) => a.order - b.order)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role}) - {m.category}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the person this member reports directly to in the
              organizational chart.
            </p>
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
                            loading="lazy"
                            className="w-full h-12 rounded-full object-cover border"
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
                        {user?.all_permissions?.includes("cms.edit") && (
                          <>
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
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.action || (() => {})}
        title="Confirm Delete"
        message={confirmModal.message}
        isDestructive={true}
      />
    </div>
  );
};

export default OrganizationManager;
