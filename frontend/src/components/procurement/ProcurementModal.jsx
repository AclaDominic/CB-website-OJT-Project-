import React, { useState, useEffect } from "react";
import { X, Plus, Trash } from "lucide-react";
import axiosClient from "../../lib/axios";
import { toast } from "react-hot-toast";

const ProcurementModal = ({
  isOpen,
  onClose,
  onSuccess,
  projects: preloadedProjects = [],
}) => {
  const [localProjects, setLocalProjects] = useState([]);
  const [formData, setFormData] = useState({
    project_id: "",
    remarks: "",
    items: [{ name: "", quantity: "", unit: "", notes: "" }],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (preloadedProjects && preloadedProjects.length > 0) {
        setLocalProjects(
          preloadedProjects.filter((p) => p.status === "ongoing"),
        );
      } else {
        fetchProjects();
      }
    }
  }, [isOpen, preloadedProjects]);

  const fetchProjects = async () => {
    try {
      const response = await axiosClient.get("/api/projects");
      setLocalProjects(
        (response.data.data || response.data).filter(
          (p) => p.status === "ongoing",
        ),
      );
    } catch (error) {
      console.error("Failed to fetch projects");
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { name: "", quantity: "", unit: "", notes: "" },
      ],
    });
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic Validation
    if (!formData.project_id) {
      toast.error("Please select a project");
      setLoading(false);
      return;
    }

    try {
      await axiosClient.post("/api/procurement", formData);
      toast.success("Request created successfully");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create request");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            New Procurement Request
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={formData.project_id}
              onChange={(e) =>
                setFormData({ ...formData, project_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            >
              <option value="">Select Project</option>
              {localProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remarks (Optional)
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              rows="2"
              placeholder="Authorized personnel remarks..."
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-green-600 font-medium hover:text-green-700 flex items-center gap-1"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-start bg-gray-50 p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(index, "name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 outline-none text-sm"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      placeholder="Qty"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 outline-none text-sm"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(index, "unit", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 outline-none text-sm"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Notes (Optional)"
                      value={item.notes}
                      onChange={(e) =>
                        handleItemChange(index, "notes", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-green-500 outline-none text-sm"
                    />
                  </div>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-400 hover:text-red-600 p-2"
                    >
                      <Trash size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Draft..." : "Create Draft"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcurementModal;
