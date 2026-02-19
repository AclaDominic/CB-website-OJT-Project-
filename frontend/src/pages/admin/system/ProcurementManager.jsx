import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye } from "lucide-react";
import axiosClient from "../../../lib/axios";
import { useAuth } from "../../../context/AuthContext";
import ProcurementModal from "../../../components/procurement/ProcurementModal";
import ProcurementDetailModal from "../../../components/procurement/ProcurementDetailModal"; // We will create this next

const ProcurementManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active"); // active, completed
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null); // For View/Edit
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get(
        `/api/procurement?tab=${activeTab}`,
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Failed to fetch procurement requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    fetchRequests();
    setIsCreateModalOpen(false);
  };

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleDetailClose = (shouldRefresh = false) => {
    setIsDetailModalOpen(false);
    setSelectedRequest(null);
    if (shouldRefresh) {
      fetchRequests();
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.id.toString().includes(search) ||
      req.project?.name.toLowerCase().includes(search.toLowerCase()) ||
      req.user?.name.toLowerCase().includes(search.toLowerCase()),
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-200 text-gray-600";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Procurement</h1>
        {user?.all_permissions?.includes("procurement.create") && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Make Request
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("active")}
            className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${
                              activeTab === "active"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
                        `}
          >
            Active (Draft, Submitted, Processing)
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${
                              activeTab === "completed"
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }
                        `}
          >
            Completed & Archived
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by ID, Project, or Requester..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>
        {/* Potentially Add Date Filter or Status Filter dropdown here */}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Project</th>
              <th className="px-6 py-4 font-semibold text-gray-600">
                Requester
              </th>
              <th className="px-6 py-4 font-semibold text-gray-600">Date</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 font-semibold text-gray-600 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Loading requests...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No requests found.
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    #{req.id}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {req.project?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{req.user?.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(req.status)}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewDetail(req)}
                      className="text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <ProcurementModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {isDetailModalOpen && selectedRequest && (
        <ProcurementDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleDetailClose}
          request={selectedRequest}
        />
      )}
    </div>
  );
};

export default ProcurementManager;
