import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import {
  Package,
  Plus,
  Trash2,
  Edit2,
  X,
  Loader2,
  ClipboardList,
  Archive,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import PageLoader from "../../../components/PageLoader";

const InventoryManager = () => {
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' or 'stock'
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/inventory-categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
      </div>

      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-2 px-4 flex items-center gap-2 font-medium ${activeTab === "catalog" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <ClipboardList size={20} /> Item Catalog
        </button>
        <button
          onClick={() => setActiveTab("stock")}
          className={`pb-2 px-4 flex items-center gap-2 font-medium ${activeTab === "stock" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Archive size={20} /> Stock Management
        </button>
      </div>

      {activeTab === "catalog" ? (
        <ItemCatalog
          user={user}
          categories={categories}
          loading={loading}
          refresh={fetchData}
        />
      ) : (
        <StockManagement
          user={user}
          categories={categories}
          loading={loading}
          refresh={fetchData}
        />
      )}
    </div>
  );
};

import Pagination from "../../../components/Pagination";

const ITEMS_PER_PAGE = 12;

const ItemCatalog = ({ user, categories, loading, refresh }) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catalogPages, setCatalogPages] = useState({});

  const handlePageChange = (categoryId, newPage) => {
    setCatalogPages((prev) => ({ ...prev, [categoryId]: newPage }));
  };

  // Item Modal state moved to StockManagement, but we might need viewing/editing here too?
  // User said "Add new item should be on Stock Management".
  // Assuming editing existing can stay here or move?
  // Let's keep editing here for now but remove "Add New Item".
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const deleteItem = async (id) => {
    if (
      !window.confirm(
        "Are you sure? This will delete the item and all its history.",
      )
    )
      return;
    try {
      await axiosClient.delete(`/api/inventory-items/${id}`);
      toast.success("Item deleted");
      refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete item");
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        {user?.all_permissions?.includes("inventory.create") && (
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            <Settings size={20} /> Manage Types
          </button>
        )}
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 border-b flex justify-between items-center rounded-t-lg">
              <h3 className="text-lg font-bold text-white">{category.name}</h3>
              <span className="text-sm text-blue-100">
                {category.description}
              </span>
            </div>
            <div className="p-6">
              {category.items && category.items.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items
                      .slice(
                        ((catalogPages[category.id] || 1) - 1) * ITEMS_PER_PAGE,
                        (catalogPages[category.id] || 1) * ITEMS_PER_PAGE,
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold">{item.name}</h4>
                            <span className="bg-gray-100 text-xs px-2 py-1 rounded">
                              Qty: {item.quantity} {item.unit}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.description || "No description"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Threshold: {item.threshold}
                          </p>

                          {user?.all_permissions?.includes(
                            "inventory.edit",
                          ) && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setIsItemModalOpen(true);
                                }}
                                className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                  {Math.ceil(category.items.length / ITEMS_PER_PAGE) > 1 && (
                    <Pagination
                      currentPage={catalogPages[category.id] || 1}
                      totalPages={Math.ceil(
                        category.items.length / ITEMS_PER_PAGE,
                      )}
                      onPageChange={(page) =>
                        handlePageChange(category.id, page)
                      }
                    />
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic text-center py-4">
                  No items in this category.
                </p>
              )}
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed">
            <p className="text-gray-500">
              No categories found. Create a category to get started.
            </p>
          </div>
        )}
      </div>

      {isItemModalOpen && (
        <ItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          item={editingItem}
          categories={categories}
          refresh={refresh}
        />
      )}

      {isCategoryModalOpen && (
        <CategoryManagerModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          refresh={refresh}
        />
      )}
    </div>
  );
};

const STOCK_ITEMS_PER_PAGE = 10;

const StockManagement = ({ user, categories, loading, refresh }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockPages, setStockPages] = useState({});

  const handlePageChange = (categoryId, newPage) => {
    setStockPages((prev) => ({ ...prev, [categoryId]: newPage }));
  };
  const [adjustmentType, setAdjustmentType] = useState(null); // 'add' or 'remove'
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Item Modal logic for "Add New Item" here
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleAdjustment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const endpoint =
        adjustmentType === "add"
          ? `/api/inventory-items/${selectedItem.id}/add-stock`
          : `/api/inventory-items/${selectedItem.id}/remove-stock`;

      await axiosClient.post(endpoint, {
        quantity: parseInt(quantity),
        remarks,
      });

      toast.success(
        `Stock ${adjustmentType === "add" ? "added" : "removed"} successfully`,
      );
      setSelectedItem(null);
      setQuantity("");
      setRemarks("");
      refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to adjust stock");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        {user?.all_permissions?.includes("inventory.create") && (
          <button
            onClick={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <Plus size={20} /> Add New Item
          </button>
        )}
      </div>

      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 border-b rounded-t-lg">
            <h3 className="text-lg font-bold text-white">{category.name}</h3>
          </div>
          <div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(
                  category.items?.slice(
                    ((stockPages[category.id] || 1) - 1) * STOCK_ITEMS_PER_PAGE,
                    (stockPages[category.id] || 1) * STOCK_ITEMS_PER_PAGE,
                  ) || []
                ).map((item) => (
                  <tr
                    key={item.id}
                    className={
                      item.quantity <= item.threshold ? "bg-red-50" : ""
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      {item.quantity <= item.threshold && (
                        <div className="text-xs text-red-600 flex items-center gap-1">
                          <AlertTriangle size={12} /> Low Stock (Threshold:{" "}
                          {item.threshold})
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sku || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.quantity <= item.threshold ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                      >
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {user?.all_permissions?.includes("inventory.edit") && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setAdjustmentType("add");
                            }}
                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded"
                          >
                            + Restock
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setAdjustmentType("remove");
                            }}
                            className="text-amber-600 hover:text-amber-900 bg-amber-50 px-3 py-1 rounded"
                          >
                            - Consume
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {(!category.items || category.items.length === 0) && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No items available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {category.items &&
              Math.ceil(category.items.length / STOCK_ITEMS_PER_PAGE) > 1 && (
                <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
                  <Pagination
                    currentPage={stockPages[category.id] || 1}
                    totalPages={Math.ceil(
                      category.items.length / STOCK_ITEMS_PER_PAGE,
                    )}
                    onPageChange={(page) => handlePageChange(category.id, page)}
                  />
                </div>
              )}
          </div>
        </div>
      ))}

      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {adjustmentType === "add" ? "Restock" : "Remove Stock"} -{" "}
                {selectedItem.name}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAdjustment}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Quantity ({selectedItem.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-2 border rounded"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Remarks
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    adjustmentType === "add"
                      ? "e.g., Monthly restock"
                      : "e.g., Office use"
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 text-white rounded ${adjustmentType === "add" ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}`}
                >
                  {submitting ? "Saving..." : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isItemModalOpen && (
        <ItemModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          item={editingItem}
          categories={categories}
          refresh={refresh}
        />
      )}
    </div>
  );
};

const ItemModal = ({ isOpen, onClose, item, categories, refresh }) => {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    sku: "",
    description: "",
    unit: "pcs",
    threshold: "5",
    initial_stock: "0",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category_id: item.category_id,
        sku: item.sku || "",
        description: item.description || "",
        unit: item.unit || "pcs",
        threshold: item.threshold,
        initial_stock: "0", // Stock not editable directly here after creation
      });
    }
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (item) {
        await axiosClient.put(`/api/inventory-items/${item.id}`, formData);
      } else {
        await axiosClient.post("/api/inventory-items", formData);
      }
      toast.success("Item saved");
      refresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save item");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {item ? "Edit Item" : "New Item"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              className="w-full p-2 border rounded"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="w-full p-2 border rounded"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                SKU (Optional)
              </label>
              <input
                className="w-full p-2 border rounded"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit</label>
              <input
                className="w-full p-2 border rounded"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min="0"
              className="w-full p-2 border rounded"
              value={formData.threshold}
              onChange={(e) =>
                setFormData({ ...formData, threshold: e.target.value })
              }
              required
            />
          </div>
          {!item && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                min="0"
                className="w-full p-2 border rounded"
                value={formData.initial_stock}
                onChange={(e) =>
                  setFormData({ ...formData, initial_stock: e.target.value })
                }
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full p-2 border rounded"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
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
  );
};

const CategoryManagerModal = ({ isOpen, onClose, refresh }) => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const response = await axiosClient.get("/api/inventory-categories");
    setCategories(response.data);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post("/api/inventory-categories", {
        name,
        description,
      });
      setName("");
      setDescription("");
      fetchData();
      refresh(); // Refresh parent
      toast.success("Category added");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add category");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? Items in it will be deleted."))
      return;
    try {
      await axiosClient.delete(`/api/inventory-categories/${id}`);
      fetchData();
      refresh();
      toast.success("Category deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Manage Inventory Types</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleCreate}
          className="mb-8 bg-gray-50 p-4 rounded border"
        >
          <h4 className="font-semibold mb-2">Add New Type</h4>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-1 p-2 border rounded"
              placeholder="Category Name (e.g., Inks)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add
            </button>
          </div>
          <input
            className="w-full p-2 border rounded"
            placeholder="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </form>

        <div className="space-y-2">
          {categories.map((c) => (
            <div
              key={c.id}
              className="flex justify-between items-center p-3 border rounded"
            >
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.description}</div>
                <div className="text-xs text-gray-400">
                  {c.items_count} items
                </div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="text-red-500 hover:text-red-700 border p-1 rounded hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
