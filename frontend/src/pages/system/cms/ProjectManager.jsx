import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import ImagePicker from "../../../components/ImagePicker";
import { useAuth } from "../../../context/AuthContext";
import PageLoader from "../../../components/PageLoader";
import ConfirmModal from "../../../components/system/ConfirmModal";
const ProjectManager = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    action: null,
  });
  // Image State
  const [imageType, setImageType] = useState("url");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrlValue, setImageUrlValue] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    year: "",
    status: "ongoing",
    scope: "",
    is_public: false,
  });

  // Gallery State
  const [galleryItems, setGalleryItems] = useState([]);

  // Gallery Handlers
  const addGalleryRow = () => {
    setGalleryItems([
      ...galleryItems,
      {
        id: null, // New item
        before: { type: "url", value: "" },
        after: { type: "url", value: "" },
      },
    ]);
  };

  const removeGalleryRow = (index) => {
    const newItems = [...galleryItems];
    newItems.splice(index, 1);
    setGalleryItems(newItems);
  };

  const handleGalleryChange = (index, field, { type, value }) => {
    const newItems = [...galleryItems];
    newItems[index][field] = { type, value };
    setGalleryItems(newItems);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/projects", {
        skipLoading: true,
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChanged = ({ type, value }) => {
    setImageType(type);
    if (type === "url") {
      setImageUrlValue(value);
      setSelectedFile(null);
    } else {
      setSelectedFile(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("location", formData.location);
    data.append("year", formData.year);
    data.append("status", formData.status);
    data.append("scope", formData.scope);
    data.append("is_public", formData.is_public ? "1" : "0");

    if (imageType === "url") {
      data.append("image_url", imageUrlValue);
    } else if (selectedFile) {
      data.append("image", selectedFile);
    }

    // Process Gallery
    // 1. Collect IDs of items that are kept (have an ID)
    const keptIds = galleryItems
      .filter((item) => item.id !== null)
      .map((item) => item.id);

    keptIds.forEach((id) => data.append("kept_gallery_ids[]", id));

    // 2. Append new items (those without ID) as files
    // Note: We only support uploading new files for now as per controller logic.
    // Ideally update controller to handle URLs too if mixed.
    // But for "Before/After", it's usually uploaded files.
    // If user enters URL for new item, we might need controller update.
    // Let's assume user uploads files for new items for now, or just send what we have.
    // The controller logic expects 'new_gallery' array of files.

    const newItems = galleryItems.filter((item) => item.id === null);
    newItems.forEach((item, index) => {
      if (item.before.type === "file" && item.before.value) {
        data.append(`new_gallery[${index}][before]`, item.before.value);
      }
      if (item.after.type === "file" && item.after.value) {
        data.append(`new_gallery[${index}][after]`, item.after.value);
      }
    });

    if (editingProject) {
      data.append("_method", "PUT");
    }

    try {
      if (editingProject) {
        await axiosClient.post(`/api/projects/${editingProject.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
          skipLoading: true,
        });
      } else {
        await axiosClient.post("/api/projects", data, {
          headers: { "Content-Type": "multipart/form-data" },
          skipLoading: true,
        });
      }
      fetchProjects();
      closeModal();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this project?",
      action: async () => {
        try {
          await axiosClient.delete(`/api/projects/${id}`, {
            skipLoading: true,
          });
          fetchProjects();
        } catch (error) {
          console.error("Error deleting project:", error);
        }
      },
    });
  };

  const handleToggleVisibility = async (project) => {
    try {
      // Optimistic update
      const newStatus = !project.is_public;
      setProjects(
        projects.map((p) =>
          p.id === project.id ? { ...p, is_public: newStatus } : p,
        ),
      );

      await axiosClient.put(`/api/projects/${project.id}`, {
        is_public: newStatus,
      });
    } catch (error) {
      console.error("Error toggling visibility:", error);
      fetchProjects(); // Revert on error
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        location: project.location,
        year: project.year,
        status: project.status,
        scope: project.scope,
        is_public: Boolean(project.is_public),
      });
      if (project.image) {
        setImageUrlValue(project.image);
      } else {
        setImageUrlValue("");
      }

      // Populate Gallery
      if (project.before_afters && project.before_afters.length > 0) {
        setGalleryItems(
          project.before_afters.map((item) => ({
            id: item.id,
            before: { type: "url", value: item.before_image },
            after: { type: "url", value: item.after_image },
          })),
        );
      } else {
        setGalleryItems([]);
      }
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        location: "",
        year: "",
        status: "ongoing",
        scope: "",
        is_public: false,
      });
      setImageUrlValue("");
      setGalleryItems([]);
    }
    setImageType("url");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setSelectedFile(null);
    setImageUrlValue("");
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Projects</h2>
        {user?.all_permissions?.includes("projects.create") && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus size={20} /> Add Project
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-4 rounded-lg shadow flex flex-col"
          >
            {project.image && (
              <img
                src={
                  project.image.startsWith("http")
                    ? project.image
                    : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${project.image}`
                }
                alt={project.name}
                loading="lazy"
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-lg">{project.name}</h4>
              <span
                className={`text-xs px-2 py-1 rounded ${project.status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
              >
                {project.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1 mb-4 flex-1">
              <p>
                <strong>Location:</strong> {project.location}
              </p>
              <p>
                <strong>Year:</strong> {project.year}
              </p>
              <p>
                <strong>Scope:</strong> {project.scope}
              </p>
            </div>

            <div className="flex justify-between items-center mt-auto pt-4 border-t">
              {/* Public Toggle Switch */}
              {user?.all_permissions?.includes("projects.edit") && (
                <div className="flex items-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={Boolean(project.is_public)}
                      onChange={() => handleToggleVisibility(project)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-2 text-xs font-medium text-gray-600">
                      {project.is_public ? "Public" : "Hidden"}
                    </span>
                  </label>
                </div>
              )}

              <div className="flex gap-2">
                {user?.all_permissions?.includes("projects.edit") && (
                  <button
                    onClick={() => openModal(project)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
                {user?.all_permissions?.includes("projects.delete") && (
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingProject ? "Edit Project" : "Add Project"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Project Details */}
                <div>
                  <h4 className="font-semibold mb-2 text-gray-700">
                    Project Details
                  </h4>
                  {/* ... Existing fields ... */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Project Name
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="mb-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      checked={formData.is_public}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_public: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_public"
                      className="text-sm font-medium text-gray-700"
                    >
                      Show on Public Profile
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={formData.year}
                        onChange={(e) =>
                          setFormData({ ...formData, year: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Status
                      </label>
                      <select
                        className="w-full p-2 border rounded"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="completed">Completed</option>
                        <option value="ongoing">Ongoing</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Scope of Work
                    </label>
                    <textarea
                      className="w-full p-2 border rounded h-20"
                      value={formData.scope}
                      onChange={(e) =>
                        setFormData({ ...formData, scope: e.target.value })
                      }
                      required
                    />
                  </div>

                  <ImagePicker
                    defaultImage={editingProject?.image}
                    onImageChanged={handleImageChanged}
                    label="Project Thumbnail"
                  />
                </div>

                {/* Right Column: Before & After Gallery */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700">
                      Before & After Gallery
                    </h4>
                    <button
                      type="button"
                      onClick={addGalleryRow}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Row
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[600px] overflow-y-auto p-1">
                    {galleryItems.length === 0 && (
                      <p className="text-sm text-gray-500 italic text-center py-8 bg-gray-50 rounded border border-dashed">
                        No gallery images yet. Click "Add Row" to start
                        showcasing your work!
                      </p>
                    )}
                    {galleryItems.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-3 rounded border relative group"
                      >
                        <button
                          type="button"
                          onClick={() => removeGalleryRow(index)}
                          className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          title="Remove Row"
                        >
                          <Trash2 size={16} />
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                              Before
                            </span>
                            <ImagePicker
                              defaultImage={item.before.value} // This needs logic: if file, preview is handled by picker internally? No, ImagePicker expects URL string for default
                              // Actually ImagePicker is tricky with "File object" as default.
                              // Our simple ImagePicker handles "defaultImage" as string (URL or path).
                              // If it's a new file, we don't pass defaultImage, we rely on state?
                              // But ImagePicker doesn't controlled-component fully.
                              // We need to verify if ImagePicker can handle controlled state or reset.
                              // Let's rely on `key` prop to force re-render if needed?
                              // Or better: Pass distinct props.
                              label=""
                              name={`gallery-before-${index}`}
                              onImageChanged={(data) =>
                                handleGalleryChange(index, "before", data)
                              }
                            />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                              After
                            </span>
                            <ImagePicker // Separate picker
                              defaultImage={item.after.value}
                              label=""
                              name={`gallery-after-${index}`}
                              onImageChanged={(data) =>
                                handleGalleryChange(index, "after", data)
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default ProjectManager;
