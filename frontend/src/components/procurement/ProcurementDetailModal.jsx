import React, { useState } from "react";
import {
  X,
  CheckCircle,
  Truck,
  Archive,
  Send,
  Clock,
  AlertCircle,
  Trash2,
} from "lucide-react";
import axiosClient from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import ConfirmModal from "../system/ConfirmModal";

const ProcurementDetailModal = ({ isOpen, onClose, request }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [supplierNotes, setSupplierNotes] = useState(
    request.supplier_notes || "",
  );
  const [expectedArrivalDate, setExpectedArrivalDate] = useState(
    request.expected_arrival_date || "",
  );

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  if (!isOpen || !request) return null;

  const initiateStatusChange = (newStatus) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirm Status Change",
      message: `Are you sure you want to change status to ${newStatus}?`,
      onConfirm: () => executeStatusChange(newStatus),
    });
  };

  const executeStatusChange = async (newStatus) => {
    setLoading(true);
    try {
      const payload = { status: newStatus };
      if (newStatus === "processing") {
        payload.supplier_notes = supplierNotes;
        payload.expected_arrival_date = expectedArrivalDate;
      }

      await axiosClient.post(`/api/procurement/${request.id}/status`, payload);
      toast.success(`Request status updated to ${newStatus}`);
      onClose(true); // Close and refresh
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const initiateDelete = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Request",
      message:
        "Are you sure you want to delete this draft request? This action cannot be undone.",
      onConfirm: executeDelete,
      isDestructive: true,
    });
  };

  const executeDelete = async () => {
    setLoading(true);
    try {
      await axiosClient.delete(`/api/procurement/${request.id}`);
      toast.success("Request deleted successfully");
      onClose(true); // Close and refresh
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete request");
    } finally {
      setLoading(false);
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      processing: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      archived: "bg-gray-200 text-gray-600",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colors[status] || "bg-gray-100"}`}
      >
        {status}
      </span>
    );
  };

  // Permission Checks Helpers
  const canSubmit =
    request.status === "draft" &&
    user?.all_permissions?.includes("procurement.submit") &&
    request.requested_by?.id === user.id;
  // const canSubmit = request.status === 'draft' && user?.all_permissions?.includes('procurement.submit'); // If generic submit allowed
  const canProcess =
    request.status === "submitted" &&
    user?.all_permissions?.includes("procurement.process");
  const canComplete =
    request.status === "processing" &&
    user?.all_permissions?.includes("procurement.complete");
  const canArchive =
    request.status === "completed" &&
    user?.all_permissions?.includes("procurement.archive");
  const canDelete =
    request.status === "draft" &&
    user?.all_permissions?.includes("procurement.delete") &&
    request.requested_by?.id === user.id;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">
                Request #{request.id}
              </h2>
              <StatusBadge status={request.status} />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Project:{" "}
              <span className="font-medium text-gray-700">
                {request.project?.name}
              </span>{" "}
              • Requester:{" "}
              <span className="font-medium text-gray-700">
                {request.user?.name}
              </span>{" "}
              • Date: {new Date(request.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => onClose(false)}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Items Table */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">
              Requested Items
            </h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Item Name</th>
                    <th className="px-4 py-3 font-medium">Quantity</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {request.items?.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{item.unit}</td>
                      <td className="px-4 py-3 text-gray-500 italic">
                        {item.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Requester Remarks */}
          {request.remarks && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">
                Requester Remarks
              </h4>
              <p className="text-gray-600 text-sm">{request.remarks}</p>
            </div>
          )}

          {/* Processing Details (Visible if status is Processing/Completed/Archived OR if user can process) */}
          {(["processing", "completed", "archived"].includes(request.status) ||
            canProcess) && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 space-y-4">
              <h4 className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                <Truck size={16} /> Fulfillment Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-yellow-800 uppercase mb-1">
                    Supplier Notes / Remarks
                  </label>
                  {canProcess ? (
                    <textarea
                      value={supplierNotes}
                      onChange={(e) => setSupplierNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500 outline-none text-sm bg-white"
                      rows="3"
                      placeholder="Enter supplier details, PO numbers, etc."
                    />
                  ) : (
                    <p className="text-sm text-gray-700 bg-white p-2 rounded border border-yellow-200 min-h-[60px]">
                      {request.supplier_notes || "No notes provided."}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-yellow-800 uppercase mb-1">
                    Expected Arrival
                  </label>
                  {canProcess ? (
                    <input
                      type="date"
                      value={expectedArrivalDate}
                      onChange={(e) => setExpectedArrivalDate(e.target.value)}
                      className="w-full px-3 py-2 border border-yellow-300 rounded focus:ring-2 focus:ring-yellow-500 outline-none text-sm bg-white"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 bg-white p-2 rounded border border-yellow-200">
                      {request.expected_arrival_date
                        ? new Date(
                            request.expected_arrival_date,
                          ).toLocaleDateString()
                        : "Not specified"}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button
            onClick={() => onClose(false)}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Close
          </button>

          {canDelete && (
            <button
              onClick={initiateDelete}
              disabled={loading}
              className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 flex items-center gap-2 mr-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={18} /> Delete Draft
            </button>
          )}

          {canSubmit && (
            <button
              onClick={() => initiateStatusChange("submitted")}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} /> Submit Request
            </button>
          )}

          {canProcess && (
            <button
              onClick={() => initiateStatusChange("processing")}
              disabled={loading || !supplierNotes} // require notes? optional
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Clock size={18} /> Start Processing
            </button>
          )}

          {canComplete && (
            <button
              onClick={() => initiateStatusChange("completed")}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} /> Mark Completed
            </button>
          )}

          {canArchive && (
            <button
              onClick={() => initiateStatusChange("archived")}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Archive size={18} /> Archive
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive} // Pass destructive flag
      />
    </div>
  );
};

export default ProcurementDetailModal;
