import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Eye } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosClient from "../../../lib/axios";
import { useAuth } from "../../../context/AuthContext";
import ProcurementModal from "../../../components/procurement/ProcurementModal";
import ProcurementDetailModal from "../../../components/procurement/ProcurementDetailModal"; // We will create this next
import Pagination from "../../../components/Pagination";

const REQUESTS_PER_PAGE = 15;

const ProcurementManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("active"); // active, completed, report

  const [tabData, setTabData] = useState({
    active: { items: [], loaded: false },
    completed: { items: [], loaded: false },
  });
  const [searchQueries, setSearchQueries] = useState({
    active: "",
    completed: "",
  });
  const [pages, setPages] = useState({ active: 1, completed: 1 });

  const [loading, setLoading] = useState(true);

  const requests = activeTab in tabData ? tabData[activeTab].items : [];
  const search = activeTab in searchQueries ? searchQueries[activeTab] : "";
  const currentPage = activeTab in pages ? pages[activeTab] : 1;

  const setSearch = (val) => {
    setSearchQueries((prev) => ({ ...prev, [activeTab]: val }));
    setPages((prev) => ({ ...prev, [activeTab]: 1 }));
  };

  const setCurrentPage = (val) => {
    setPages((prev) => ({ ...prev, [activeTab]: val }));
  };

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null); // For View/Edit
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [reportFilter, setReportFilter] = useState({
    project_id: "",
    date_range: "",
  });
  const [projects, setProjects] = useState([]);
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    if (activeTab === "report") {
      if (projects.length === 0) fetchProjects();
    } else {
      if (!tabData[activeTab]?.loaded) {
        fetchRequests(activeTab);
      }
    }
  }, [activeTab]);

  const fetchProjects = async () => {
    try {
      const response = await axiosClient.get("/api/projects");
      setProjects(response.data.data || response.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const response = await axiosClient.get("/api/procurement/report", {
        params: reportFilter,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `procurement-report-${new Date().getTime()}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to generate report", error);
      if (error.response && error.response.status === 404) {
        // Blob responses need to be read to get the json error message
        if (error.response.data instanceof Blob) {
          error.response.data.text().then((text) => {
            try {
              const json = JSON.parse(text);
              toast.error(json.message || "No procurement requests found.");
            } catch (e) {
              toast.error("No procurement requests found.");
            }
          });
        } else {
          toast.error(
            error.response.data?.message || "No procurement requests found.",
          );
        }
      } else {
        toast.error("Failed to generate report.");
      }
    } finally {
      setGeneratingReport(false);
    }
  };

  const fetchRequests = async (targetTab = activeTab) => {
    setLoading(true);
    try {
      const response = await axiosClient.get(
        `/api/procurement?tab=${targetTab}`,
      );
      setTabData((prev) => ({
        ...prev,
        [targetTab]: {
          items: response.data.data || response.data,
          loaded: true,
        },
      }));
    } catch (error) {
      console.error("Failed to fetch procurement requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setTabData({
      active: { items: [], loaded: false },
      completed: { items: [], loaded: false },
    });
    fetchRequests("active");
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
      if (activeTab !== "report") {
        fetchRequests(activeTab);
      }
    }
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.id.toString().includes(search) ||
      req.project?.name.toLowerCase().includes(search.toLowerCase()) ||
      req.user?.name.toLowerCase().includes(search.toLowerCase()),
  );

  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * REQUESTS_PER_PAGE,
    currentPage * REQUESTS_PER_PAGE,
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
          {user?.all_permissions?.includes("procurement.report") && (
            <button
              onClick={() => setActiveTab("report")}
              className={`
                              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                              ${
                                activeTab === "report"
                                  ? "border-green-500 text-green-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                              }
                          `}
            >
              Generate Report
            </button>
          )}
        </nav>
      </div>

      {activeTab === "report" ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Report Configuration
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Filter
              </label>
              <select
                value={reportFilter.project_id}
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    project_id: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Projects (Mixed)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={reportFilter.date_range}
                onChange={(e) =>
                  setReportFilter({
                    ...reportFilter,
                    date_range: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              >
                <option value="">All Time</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="current_year">Current Year</option>
                <option value="last_year">Last Year</option>
              </select>
            </div>
            <div className="pt-4">
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generatingReport
                  ? "Generating PDF..."
                  : "Generate & Download PDF"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto mt-6">
            <table className="w-full text-left">
              <thead className="bg-blue-600 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-white">ID</th>
                  <th className="px-6 py-4 font-bold text-white">Project</th>
                  <th className="px-6 py-4 font-bold text-white">Requester</th>
                  <th className="px-6 py-4 font-bold text-white">Date</th>
                  <th className="px-6 py-4 font-bold text-white">Status</th>
                  <th className="px-6 py-4 font-bold text-white text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      Loading requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        #{req.id}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {req.project?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {req.user?.name}
                      </td>
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

            {Math.ceil(filteredRequests.length / REQUESTS_PER_PAGE) > 1 && (
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 sm:px-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(
                    filteredRequests.length / REQUESTS_PER_PAGE,
                  )}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </>
      )}

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
