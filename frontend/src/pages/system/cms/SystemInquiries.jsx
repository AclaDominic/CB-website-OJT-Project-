import React, { useState, useEffect } from "react";
import api from "../../../lib/axios";
import { useAuth } from "../../../context/AuthContext";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import ConfirmModal from "../../../components/system/ConfirmModal";
import PageLoader from "../../../components/PageLoader";

const SystemInquiries = () => {
  const [tabData, setTabData] = useState({
    inbox: { items: [], loaded: false },
    archived: { items: [], loaded: false },
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("inbox");
  const { user } = useAuth();

  // Filters
  const [filters, setFilters] = useState({
    inbox: { dateFrom: "", dateTo: "" },
    archived: { dateFrom: "", dateTo: "", archivedFrom: "", archivedTo: "" },
  });

  const inquiries = tabData[activeTab]?.items || [];
  const currentFilters = filters[activeTab] || {};
  const { dateFrom, dateTo, archivedFrom, archivedTo } = currentFilters;

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [key]: value,
      },
    }));
  };

  // Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDestructive: false,
    confirmText: "Confirm",
  });

  useEffect(() => {
    if (!tabData[activeTab].loaded) {
      fetchInquiries(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (tabData[activeTab].loaded) {
      fetchInquiries(activeTab);
    }
  }, [filters[activeTab]]);

  const fetchInquiries = async (tabToFetch = activeTab) => {
    setLoading(true);
    try {
      const tabFilters = filters[tabToFetch] || {};
      const params = {
        archived: tabToFetch === "archived" ? 1 : 0,
        ...(tabFilters.dateFrom && { date_from: tabFilters.dateFrom }),
        ...(tabFilters.dateTo && { date_to: tabFilters.dateTo }),
        ...(tabFilters.archivedFrom && {
          archived_from: tabFilters.archivedFrom,
        }),
        ...(tabFilters.archivedTo && { archived_to: tabFilters.archivedTo }),
      };

      const response = await api.get("/api/inquiries", { params });
      setTabData((prev) => ({
        ...prev,
        [tabToFetch]: { items: response.data, loaded: true },
      }));
    } catch (error) {
      console.error("Error fetching inquiries", error);
      toast.error("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  const openArchiveModal = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Archive Inquiry",
      message:
        "Are you sure you want to archive this inquiry? It will be moved to the Archived tab.",
      confirmText: "Archive",
      isDestructive: false,
      onConfirm: async () => {
        try {
          await api.put(`/api/inquiries/${id}/archive`);
          fetchInquiries();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  const openDeleteModal = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Inquiry",
      message:
        "Are you sure you want to permanently delete this inquiry? This action cannot be undone.",
      confirmText: "Delete",
      isDestructive: true,
      onConfirm: async () => {
        try {
          await api.delete(`/api/inquiries/${id}`);
          fetchInquiries();
        } catch (error) {
          console.error(error);
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium transition-colors ${activeTab === "inbox" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => {
            setActiveTab("inbox");
          }}
        >
          Inbox
        </button>
        <button
          className={`py-2 px-4 font-medium transition-colors ${activeTab === "archived" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("archived")}
        >
          Archived
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
        {/* ... existing filters ... */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date Sent (From)
          </label>
          <input
            type="date"
            value={dateFrom || ""}
            onChange={(e) => updateFilter("dateFrom", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Date Sent (To)
          </label>
          <input
            type="date"
            value={dateTo || ""}
            onChange={(e) => updateFilter("dateTo", e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {activeTab === "archived" && (
          <>
            <div className="border-l border-gray-300 h-10 mx-2 hidden md:block"></div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date Archived (From)
              </label>
              <input
                type="date"
                value={archivedFrom || ""}
                onChange={(e) => updateFilter("archivedFrom", e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Date Archived (To)
              </label>
              <input
                type="date"
                value={archivedTo || ""}
                onChange={(e) => updateFilter("archivedTo", e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {(dateFrom || dateTo || archivedFrom || archivedTo) && (
          <button
            onClick={() => {
              setFilters((prev) => ({
                ...prev,
                [activeTab]: {
                  dateFrom: "",
                  dateTo: "",
                  archivedFrom: "",
                  archivedTo: "",
                },
              }));
            }}
            className="text-sm text-gray-500 hover:text-gray-700 underline mb-2 ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Date Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Message
                </th>
                {activeTab === "archived" && (
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Date Archived
                  </th>
                )}
                <th className="px-6 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeTab === "archived" ? 6 : 5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No inquiries found using current filters.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(inquiry.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {inquiry.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inquiry.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {inquiry.subject || (
                        <span className="text-gray-400 italic">No subject</span>
                      )}
                    </td>
                    <td
                      className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate"
                      title={inquiry.message}
                    >
                      {inquiry.message}
                    </td>
                    {activeTab === "archived" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inquiry.archived_at
                          ? new Date(inquiry.archived_at).toLocaleDateString()
                          : "-"}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {activeTab === "inbox" ? (
                        <>
                          {user?.all_permissions?.includes("cms.edit") && (
                            <>
                              <a
                                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${inquiry.email}&su=${encodeURIComponent(inquiry.subject || "Inquiry Reply")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded border border-blue-200 inline-block"
                              >
                                Reply
                              </a>
                              <button
                                onClick={() => openArchiveModal(inquiry.id)}
                                className="text-amber-600 hover:text-amber-900 bg-amber-50 px-3 py-1 rounded border border-amber-200"
                              >
                                Archive
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        user?.all_permissions?.includes("cms.edit") && (
                          <button
                            onClick={() => openDeleteModal(inquiry.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded border border-red-200"
                          >
                            Delete
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        isDestructive={confirmModal.isDestructive}
      />
    </div>
  );
};

export default SystemInquiries;
