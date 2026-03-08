import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import { Plus, Edit2, Trash2, X, Search, AlertTriangle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import PageLoader from "../../../components/PageLoader";
import ConfirmModal from "../../../components/system/ConfirmModal";
const FaqManager = () => {
  const { user } = useAuth();

  if (!user?.all_permissions?.includes("cms.view")) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
        <AlertTriangle className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-gray-700 mb-2 uppercase tracking-wide">
          Unauthorized Access
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          You do not have the required permissions to access FAQ Management.
        </p>
      </div>
    );
  }

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    action: null,
  });
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get("/api/faqs", {
        skipLoading: true,
      });
      setFaqs(response.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingFaq) {
        await axiosClient.put(`/api/faqs/${editingFaq.id}`, formData, {
          skipLoading: true,
        });
      } else {
        await axiosClient.post("/api/faqs", formData, {
          skipLoading: true,
        });
      }
      fetchFaqs();
      closeModal();
    } catch (error) {
      console.error("Error saving FAQ:", error);
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this FAQ?",
      action: async () => {
        try {
          await axiosClient.delete(`/api/faqs/${id}`, {
            skipLoading: true,
          });
          fetchFaqs();
        } catch (error) {
          console.error("Error deleting FAQ:", error);
        }
      },
    });
  };

  const openModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: "",
        answer: "",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFaq(null);
    setFormData({ question: "", answer: "" });
  };

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage FAQs</h2>
        {user?.all_permissions?.includes("cms.edit") && (
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            <Plus size={20} /> Add FAQ
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search FAQs by question or answer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-blue-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-1/3">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider w-1/2">
                Answer
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFaqs.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                  {searchQuery
                    ? "No FAQs match your search."
                    : "No FAQs found."}
                </td>
              </tr>
            ) : (
              filteredFaqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {faq.question}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <p className="line-clamp-2" title={faq.answer}>
                      {faq.answer}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user?.all_permissions?.includes("cms.edit") && (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openModal(faq)}
                          className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded border border-blue-100"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded border border-red-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl translate-y-[-10vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {editingFaq ? "Edit FAQ" : "Add FAQ"}
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
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Question
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Answer
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded h-32"
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  required
                />
              </div>

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

export default FaqManager;
