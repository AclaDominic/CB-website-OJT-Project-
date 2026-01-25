import React, { useState, useEffect } from "react";
import axiosClient from "../../lib/axios";
import { Plus, Trash2, Edit2, X, Loader2 } from "lucide-react";
import ImagePicker from "../../components/ImagePicker";

const ProjectManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Image State
  const [imageType, setImageType] = useState("url");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrlValue, setImageUrlValue] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    year: "",
    scope: "",
    status: "completed",
  });

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
    data.append("scope", formData.scope);
    data.append("status", formData.status);

    if (imageType === "url") {
      data.append("image", imageUrlValue);
    } else if (selectedFile) {
      data.append("image", selectedFile);
    }

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
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axiosClient.delete(`/api/projects/${id}`, { skipLoading: true });
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        location: project.location,
        year: project.year,
        scope: project.scope,
        status: project.status,
      });
      if (project.image) {
        setImageUrlValue(project.image);
      } else {
        setImageUrlValue("");
      }
    } else {
      setEditingProject(null);
      setFormData({
        name: "",
        location: "",
        year: "",
        scope: "",
        status: "completed",
      });
      setImageUrlValue("");
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

  if (loading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Projects</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <Plus size={20} /> Add Project
        </button>
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
            <div className="flex justify-end gap-2 mt-auto pt-4 border-t">
              <button
                onClick={() => openModal(project)}
                className="text-blue-600 hover:text-blue-800 p-1"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => handleDelete(project.id)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Year</label>
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
              />

              <div className="flex justify-end gap-2">
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
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
