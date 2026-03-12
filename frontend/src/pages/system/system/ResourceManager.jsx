import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Truck,
  MapPin,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import ImagePicker from "../../../components/ImagePicker";
import { useAuth } from "../../../context/AuthContext";
import PageLoader from "../../../components/PageLoader";
import ConfirmModal from "../../../components/system/ConfirmModal";

const ResourceManager = () => {
  const [activeTab, setActiveTab] = useState("machinery"); // 'machinery' or 'sites'
  const [showPlateNumbers, setShowPlateNumbers] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { user } = useAuth();

  if (!user?.all_permissions?.includes("inventory.view")) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
        <AlertTriangle className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-gray-700 mb-2 uppercase tracking-wide">
          Unauthorized Access
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          You do not have the required permissions to access Resource
          Management.
        </p>
      </div>
    );
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axiosClient.get(
        "/api/page-contents?page=resources",
        { skipLoading: true },
      );
      const settings = response.data.find(
        (item) => item.section_name === "display_settings",
      );
      if (settings) {
        const config = JSON.parse(settings.content);
        setShowPlateNumbers(config.show_plate_numbers);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const togglePlateNumbers = async () => {
    const newValue = !showPlateNumbers;
    setShowPlateNumbers(newValue);
    try {
      await axiosClient.post(
        "/api/page-contents",
        {
          page_name: "resources",
          section_name: "display_settings",
          content: JSON.stringify({ show_plate_numbers: newValue }),
        },
        { skipLoading: true },
      );
    } catch (error) {
      console.error("Error saving settings:", error);
      setShowPlateNumbers(!newValue); // Revert on error
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Resources</h2>

        {/* Global Settings Toggle */}
        {activeTab === "machinery" &&
          user?.all_permissions?.includes("inventory.edit") && (
            <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-lg">
              <div className="relative">
                <button
                  className="text-gray-500 hover:text-blue-600 transition-colors"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip(!showTooltip)}
                >
                  <Truck size={20} />
                </button>
                {showTooltip && (
                  <div className="absolute right-0 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs p-3 rounded shadow-lg z-10">
                    <strong>Public View Setting:</strong>
                    <br />
                    If ON: Public sees all non-decommissioned vehicles with
                    plate numbers.
                    <br />
                    If OFF: Public sees only unique models (grouped) without
                    plate numbers.
                    <div className="absolute bottom-0 right-2 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-medium ${!showPlateNumbers ? "text-blue-600" : "text-gray-500"}`}
                >
                  Summary View
                </span>
                <button
                  onClick={togglePlateNumbers}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${showPlateNumbers ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${showPlateNumbers ? "translate-x-6" : "translate-x-0"}`}
                  ></div>
                </button>
                <span
                  className={`text-sm font-medium ${showPlateNumbers ? "text-blue-600" : "text-gray-500"}`}
                >
                  Detailed View
                </span>
              </div>
            </div>
          )}
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("machinery")}
          className={`pb-2 px-4 flex items-center gap-2 font-medium ${activeTab === "machinery" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Truck size={20} /> Heavy Equipment Fleet
        </button>
        <button
          onClick={() => setActiveTab("sites")}
          className={`pb-2 px-4 flex items-center gap-2 font-medium ${activeTab === "sites" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <MapPin size={20} /> Land Development Sites
        </button>
      </div>

      <div className={activeTab === "machinery" ? "block" : "hidden"}>
        <MachineryList />
      </div>
      <div className={activeTab === "sites" ? "block" : "hidden"}>
        <SiteList />
      </div>
    </div>
  );
};

const MachineryList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    action: null,
  });
  const { user } = useAuth();

  // Image State
  const [imageType, setImageType] = useState("url");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrlValue, setImageUrlValue] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    plate_number: "",
    status: "Stand By",
    project_id: "",
  });

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchItems();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Fetch only ongoing projects for assignment
      const response = await axiosClient.get("/api/projects");
      // Filter strictly on frontend if API doesn't support status filter yet,
      // or assume API returns all. Ideally /api/projects?status=ongoing
      setProjects(response.data.filter((p) => p.status === "ongoing"));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/machineries", {
        skipLoading: true,
      });
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching machinery:", error);
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
    data.append("type", formData.type);
    data.append("plate_number", formData.plate_number || "");
    data.append("status", formData.status);
    if (formData.project_id) {
      data.append("project_id", formData.project_id);
    }

    if (imageType === "url") {
      data.append("image_url", imageUrlValue);
    } else if (selectedFile) {
      data.append("image_file", selectedFile);
    }

    // Laravel PUT method spoofing for FormData
    if (editingItem) {
      data.append("_method", "PUT");
    }

    try {
      if (editingItem) {
        await axiosClient.post(`/api/machineries/${editingItem.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
          skipLoading: true,
        });
      } else {
        await axiosClient.post("/api/machineries", data, {
          headers: { "Content-Type": "multipart/form-data" },
          skipLoading: true,
        });
      }
      fetchItems();
      closeModal();
    } catch (error) {
      console.error("Error saving machinery:", error);
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this equipment?",
      action: async () => {
        try {
          await axiosClient.delete(`/api/machineries/${id}`, {
            skipLoading: true,
          });
          fetchItems();
        } catch (error) {
          console.error("Error deleting machinery:", error);
        }
      },
    });
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        type: item.type,
        plate_number: item.plate_number || "",
        status: item.status || "Stand By",
        project_id: item.project_id || "",
      });
      // Set initial image state
      if (item.image_url) {
        setImageUrlValue(item.image_url);
      } else {
        setImageUrlValue("");
      }
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        type: "",
        plate_number: "",
        status: "Stand By",
        project_id: "",
      });
      setImageUrlValue("");
    }
    setImageType("url");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSelectedFile(null);
    setImageUrlValue("");
  };

  if (loading && items.length === 0) {
    return <PageLoader />;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {user?.all_permissions?.includes("inventory.create") && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus size={20} /> Add Equipment
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className={`bg-white p-4 rounded-lg shadow border-l-4 ${item.status === "Decommissioned" ? "border-red-500" : "border-green-500"}`}
          >
            {item.image_url && (
              <img
                src={
                  item.image_url.startsWith("http")
                    ? item.image_url
                    : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${item.image_url}`
                }
                alt={item.name}
                loading="lazy"
                className="w-full h-32 object-cover rounded mb-2"
              />
            )}
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-lg">{item.name}</h4>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.status === "Decommissioned"
                    ? "bg-red-100 text-red-800"
                    : item.status === "Active" || item.status === "in-use"
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                }`}
              >
                {item.status}
              </span>
            </div>
            <p className="text-gray-600 text-sm">Type: {item.type}</p>
            <p className="text-gray-600 text-sm mb-4">
              Plate: {item.plate_number || "N/A"}
            </p>
            <div className="flex justify-end gap-2">
              {user?.all_permissions?.includes("inventory.edit") && (
                <button
                  onClick={() => openModal(item)}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  <Edit2 size={18} />
                </button>
              )}
              {user?.all_permissions?.includes("inventory.delete") && (
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingItem ? "Edit Equipment" : "Add Equipment"}
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
                <label className="block text-sm font-medium mb-1">Name</label>
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
                <label className="block text-sm font-medium mb-1">Type</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Plate Number
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.plate_number}
                  onChange={(e) =>
                    setFormData({ ...formData, plate_number: e.target.value })
                  }
                />
              </div>

              <ImagePicker
                defaultImage={editingItem?.image_url}
                onImageChanged={handleImageChanged}
              />

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  required
                >
                  <option value="Stand By">Stand By</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Decommissioned">Decommissioned</option>
                  <option value="Lease">Lease (to others)</option>
                  <option value="Active">Active</option>
                </select>
              </div>

              {formData.status === "Active" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Assign to Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-2 border rounded"
                    value={formData.project_id || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, project_id: e.target.value })
                    }
                    required={formData.status === "Active"}
                  >
                    <option value="">Select a Project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Active equipment must be assigned to an ongoing project.
                  </p>
                </div>
              )}
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

const SiteList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    action: null,
  });
  const { user } = useAuth();

  // Image State
  const [imageType, setImageType] = useState("url");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrlValue, setImageUrlValue] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    description: "",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/development-sites", {
        skipLoading: true,
      });
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching sites:", error);
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
    data.append("capacity", formData.capacity);
    data.append("description", formData.description || "");

    if (imageType === "url") {
      data.append("image_url", imageUrlValue);
    } else if (selectedFile) {
      data.append("image", selectedFile); // Changed to 'image' to match updated controller
    }

    if (editingItem) {
      data.append("_method", "PUT");
    }

    try {
      if (editingItem) {
        await axiosClient.post(
          `/api/development-sites/${editingItem.id}`,
          data,
          {
            headers: { "Content-Type": "multipart/form-data" },
            skipLoading: true,
          },
        );
      } else {
        await axiosClient.post("/api/development-sites", data, {
          headers: { "Content-Type": "multipart/form-data" },
          skipLoading: true,
        });
      }
      fetchItems();
      closeModal();
    } catch (error) {
      console.error("Error saving site:", error);
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this site?",
      action: async () => {
        try {
          await axiosClient.delete(`/api/development-sites/${id}`, {
            skipLoading: true,
          });
          fetchItems();
        } catch (error) {
          console.error("Error deleting site:", error);
        }
      },
    });
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        location: item.location,
        capacity: item.capacity,
        description: item.description || "",
      });
      if (item.image_url) {
        setImageUrlValue(item.image_url);
      } else {
        setImageUrlValue("");
      }
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        location: "",
        capacity: "",
        description: "",
      });
      setImageUrlValue("");
    }
    setImageType("url");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSelectedFile(null);
    setImageUrlValue("");
  };

  if (loading && items.length === 0) {
    return <PageLoader />;
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        {user?.all_permissions?.includes("inventory.create") && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus size={20} /> Add Site
          </button>
        )}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow overflow-hidden group"
          >
            {item.image_url && (
              <img
                src={
                  item.image_url.startsWith("http")
                    ? item.image_url
                    : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${item.image_url}`
                }
                alt={item.name}
                loading="lazy"
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{item.name}</h3>
              <p className="text-gray-500 mb-2">{item.location}</p>
              <p className="text-green-600 font-semibold mb-2">
                {item.capacity}
              </p>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <div className="flex justify-end gap-2">
                {user?.all_permissions?.includes("inventory.edit") && (
                  <button
                    onClick={() => openModal(item)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit2 size={18} />
                  </button>
                )}
                {user?.all_permissions?.includes("inventory.delete") && (
                  <button
                    onClick={() => handleDelete(item.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingItem ? "Edit Site" : "Add Site"}
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
                  Site Name
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
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Capacity
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-2 border rounded h-20"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <ImagePicker
                defaultImage={editingItem?.image_url}
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

export default ResourceManager;
