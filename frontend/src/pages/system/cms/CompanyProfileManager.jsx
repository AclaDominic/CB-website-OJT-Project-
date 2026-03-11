import React, { useState, useEffect } from "react";
import axiosClient from "../../../lib/axios";
import {
  Upload,
  Download,
  FileText,
  Loader2,
  AlertTriangle,
  X,
  Eye,
  Link2,
  CheckCircle,
  Copy,
  ExternalLink,
  Shield,
  Trash2,
  Plus,
} from "lucide-react";
import ConfirmModal from "../../../components/system/ConfirmModal";
import { useAuth } from "../../../context/AuthContext";
import PageLoader from "../../../components/PageLoader";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CompanyProfileManager = () => {
  const { user } = useAuth();

  if (!user?.all_permissions?.includes("cms.manage-company-profile")) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
        <AlertTriangle className="w-16 h-16 text-gray-400 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-gray-700 mb-2 uppercase tracking-wide">
          Unauthorized Access
        </h2>
        <p className="text-gray-500 text-center max-w-md">
          You do not have the required permissions to access Company Profile
          Management.
        </p>
      </div>
    );
  }

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({ public: false, full: false });
  const [publicFile, setPublicFile] = useState(null);
  const [fullFile, setFullFile] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    file: null,
    type: null,
  });
  const [testDownloading, setTestDownloading] = useState({
    public: false,
    full: false,
  });
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [toast, setToast] = useState(null);
  const [links, setLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: "", action: null });

  useEffect(() => {
    fetchProfile();
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLinksLoading(true);
    try {
      const res = await axiosClient.get("/api/company-profile/links", { skipLoading: true });
      setLinks(res.data);
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLinksLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setGenerating(true);
    try {
      const res = await axiosClient.post("/api/company-profile/generate-link", {}, { skipLoading: true });
      showToast("Download link generated!");
      fetchLinks();
    } catch (error) {
      console.error(error);
      showToast(error?.response?.data?.message || "Failed to generate link.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteLink = (id) => {
    setConfirmModal({
      isOpen: true,
      message: "Are you sure you want to delete this download link?",
      action: async () => {
        try {
          await axiosClient.delete(`/api/company-profile/links/${id}`, { skipLoading: true });
          showToast("Link deleted.");
          fetchLinks();
        } catch (error) {
          console.error(error);
          showToast("Failed to delete link.", "error");
        }
      },
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Link copied to clipboard!");
    } catch {
      const input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      showToast("Link copied to clipboard!");
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/api/company-profile", {
        skipLoading: true,
      });
      setProfile(res.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      showToast("Please select a PDF file.", "error");
      return;
    }
    if (type === "public") setPublicFile(file);
    else setFullFile(file);

    // Open preview modal
    setPreviewModal({ open: true, file, type });
  };

  const confirmUpload = async () => {
    const { file, type } = previewModal;
    if (!file || !type) return;

    setPreviewModal({ open: false, file: null, type: null });
    setUploading((prev) => ({ ...prev, [type]: true }));

    try {
      const formData = new FormData();
      formData.append(
        type === "public" ? "public_profile" : "full_profile",
        file
      );
      await axiosClient.post("/api/company-profile", formData, {
        skipLoading: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast(
        `${type === "public" ? "Public" : "Full"} profile updated successfully!`
      );
      fetchProfile();
      if (type === "public") setPublicFile(null);
      else setFullFile(null);
    } catch (error) {
      console.error("Upload error:", error);
      const status = error?.response?.status;
      if (status === 413) {
        showToast("File is too large. Please use a smaller PDF (max 50MB).", "error");
      } else if (error?.response?.data?.message) {
        showToast(error.response.data.message, "error");
      } else {
        showToast("Upload failed. Please try again.", "error");
      }
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const cancelPreview = () => {
    const { type } = previewModal;
    if (type === "public") setPublicFile(null);
    else setFullFile(null);
    setPreviewModal({ open: false, file: null, type: null });
  };

  const handleTestPublicDownload = () => {
    setTestDownloading((prev) => ({ ...prev, public: true }));
    // Direct navigation triggers download via Content-Disposition: attachment
    // Works across all browsers including Chrome
    window.location.href = `${API_URL}/api/company-profile/download/public`;
    showToast("Public profile download started!");
    setTimeout(() => {
      setTestDownloading((prev) => ({ ...prev, public: false }));
    }, 3000);
  };

  const handleTestFullDownload = async () => {
    setTestDownloading((prev) => ({ ...prev, full: true }));
    try {
      // Step 1: Generate one-time link
      const res = await axiosClient.post(
        "/api/company-profile/generate-link",
        {},
        { skipLoading: true }
      );
      const { link } = res.data;
      setGeneratedLink(link);

      // Step 2: Open the link in a new tab to trigger download
      window.open(link, "_blank");
      showToast("Full profile link generated and download started!");
    } catch (error) {
      console.error(error);
      showToast("Failed to generate download link.", "error");
    } finally {
      // Debounce: disable button for 5 seconds
      setTimeout(() => {
        setTestDownloading((prev) => ({ ...prev, full: false }));
      }, 5000);
    }
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = generatedLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium flex items-center gap-2 animate-in slide-in-from-right duration-300 ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.type === "error" ? (
            <AlertTriangle size={16} />
          ) : (
            <CheckCircle size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-blue-600" size={24} />
            Company Profile Manager
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Upload and manage the public and full company profiles.
          </p>
        </div>
      </div>

      {/* Upload Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Public Profile */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Public Profile</h3>
              <p className="text-xs text-gray-500">
                Downloadable by anyone on the public website
              </p>
            </div>
          </div>

          {/* Current status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Status
            </p>
            {profile?.public_profile_path ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle size={14} /> Uploaded
              </p>
            ) : (
              <p className="text-sm text-gray-400">No file uploaded yet</p>
            )}
          </div>

          {/* File input */}
          <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors">
            <Upload size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {uploading.public ? "Uploading..." : "Choose PDF file"}
            </span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e, "public")}
              disabled={uploading.public}
            />
          </label>
        </div>

        {/* Full Profile */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Shield className="text-indigo-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Full Profile</h3>
              <p className="text-xs text-gray-500">
                Includes engineer licenses; requires one-time link
              </p>
            </div>
          </div>

          {/* Current status */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Status
            </p>
            {profile?.full_profile_path ? (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle size={14} /> Uploaded
              </p>
            ) : (
              <p className="text-sm text-gray-400">No file uploaded yet</p>
            )}
          </div>

          {/* File input */}
          <label className="flex items-center justify-center gap-2 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
            <Upload size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {uploading.full ? "Uploading..." : "Choose PDF file"}
            </span>
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFileChange(e, "full")}
              disabled={uploading.full}
            />
          </label>
        </div>
      </div>

      {/* Test Downloads */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Download size={20} className="text-gray-600" />
          Test Downloads
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Test Public Download */}
          <button
            onClick={handleTestPublicDownload}
            disabled={
              testDownloading.public || !profile?.public_profile_path
            }
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {testDownloading.public ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Test Public Profile Download
          </button>

          {/* Test Full Profile Download */}
          <button
            onClick={handleTestFullDownload}
            disabled={
              testDownloading.full || !profile?.full_profile_path
            }
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {testDownloading.full ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ExternalLink size={16} />
            )}
            {testDownloading.full
              ? "Generating & opening..."
              : "Test Full Profile Download"}
          </button>
        </div>

        {/* Generated Link Display */}
        {generatedLink && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Link2 size={12} /> Last Generated Link (one-time use)
            </p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-white px-3 py-2 rounded border border-gray-200 flex-1 truncate text-gray-700">
                {generatedLink}
              </code>
              <button
                onClick={copyLink}
                className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle size={14} className="text-green-600" />{" "}
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Download Links Management Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Link2 size={20} className="text-gray-600" />
            Full Profile Download Links
          </h3>
          <button
            onClick={handleGenerateLink}
            disabled={generating || !profile?.full_profile_path}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {generating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            Generate Link
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Link</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {linksLoading ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-400">
                    <Loader2 size={20} className="animate-spin inline-block mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-400 text-sm">
                    No download links generated yet.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {link.is_used ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                          Used
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200 text-gray-600 truncate max-w-[300px] block">
                          {link.link}
                        </code>
                        <button
                          onClick={() => copyToClipboard(link.link)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded flex-shrink-0"
                          title="Copy link"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(link.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 rounded border border-red-100 hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {previewModal.open && previewModal.file && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="text-blue-600" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Preview & Confirm</h3>
                  <p className="text-xs text-gray-500">
                    Review the {previewModal.type} profile before uploading
                  </p>
                </div>
              </div>
              <button
                onClick={cancelPreview}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* PDF Preview Area */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100">
              <iframe
                src={URL.createObjectURL(previewModal.file)}
                className="w-full h-[65vh] rounded-lg border border-gray-200 bg-white"
                title="PDF Preview"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
              <button
                onClick={cancelPreview}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                disabled={uploading[previewModal.type]}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                {uploading[previewModal.type] ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Confirm Upload
              </button>
            </div>
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

export default CompanyProfileManager;
