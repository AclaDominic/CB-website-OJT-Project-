import React, { useState, useEffect } from "react";
import axiosClient from "../../lib/axios";
import { Plus, Trash2, Edit2, X, Loader2 } from "lucide-react";
import ImagePicker from "../../components/ImagePicker";

const ServiceManager = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Image State
  const [imageType, setImageType] = useState("url");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrlValue, setImageUrlValue] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "primary",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/services", {
        skipLoading: true,
      });
      setServices(response.data);
    } catch (error) {
      console.error("Error fetching services:", error);
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
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("type", formData.type);

    if (imageType === "url") {
      data.append("image", imageUrlValue);
    } else if (selectedFile) {
      data.append("image", selectedFile);
    }

    if (editingService) {
      data.append("_method", "PUT");
    }

    try {
      if (editingService) {
        await axiosClient.post(`/api/services/${editingService.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
          skipLoading: true,
        });
      } else {
        await axiosClient.post("/api/services", data, {
          headers: { "Content-Type": "multipart/form-data" },
          skipLoading: true,
        });
      }
      fetchServices();
      closeModal();
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await axiosClient.delete(`/api/services/${id}`, { skipLoading: true });
        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        description: service.description,
        type: service.type,
      });
      if (service.image) {
        setImageUrlValue(service.image);
      } else {
        setImageUrlValue("");
      }
    } else {
      setEditingService(null);
      setFormData({
        title: "",
        description: "",
        type: "primary",
      });
      setImageUrlValue("");
    }
    setImageType("url");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setSelectedFile(null);
    setImageUrlValue("");
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Services</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <Plus size={20} /> Add Service
        </button>
      </div>

      {/* Primary Services */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">
          Primary Services
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services
            .filter((s) => s.type === "primary")
            .map((service) => (
              <div
                key={service.id}
                className="bg-white p-4 rounded-lg shadow flex flex-col"
              >
                {service.image && (
                  <img
                    src={
                      service.image.startsWith("http")
                        ? service.image
                        : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${service.image}`
                    }
                    alt={service.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h4 className="font-bold text-lg mb-2">{service.title}</h4>
                <p className="text-gray-600 text-sm mb-4 flex-1">
                  {service.description}
                </p>
                <div className="flex justify-end gap-2 mt-auto">
                  <button
                    onClick={() => openModal(service)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Secondary Services */}
      <div>
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">
          Secondary Services
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services
            .filter((s) => s.type === "secondary")
            .map((service) => (
              <div
                key={service.id}
                className="bg-white p-4 rounded-lg shadow flex flex-col"
              >
                {service.image && (
                  <img
                    src={
                      service.image.startsWith("http")
                        ? service.image
                        : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${service.image}`
                    }
                    alt={service.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h4 className="font-bold text-lg mb-2">{service.title}</h4>
                <p className="text-gray-600 text-sm mb-4 flex-1">
                  {service.description}
                </p>
                <div className="flex justify-end gap-2 mt-auto">
                  <button
                    onClick={() => openModal(service)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingService ? "Edit Service" : "Add Service"}
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
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-2 border rounded h-24"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <ImagePicker
                defaultImage={editingService?.image}
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

export default ServiceManager;
