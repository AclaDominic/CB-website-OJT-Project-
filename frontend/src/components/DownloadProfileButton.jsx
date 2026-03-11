import React, { useState, useRef, useEffect } from "react";
import { Download, Loader2, FileText, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DownloadProfileButton = ({ compact = false }) => {
    const [loading, setLoading] = useState(false);
    const [hasDownloaded, setHasDownloaded] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [animating, setAnimating] = useState(false);
    const confirmRef = useRef(null);

    // Close confirm dialog when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (confirmRef.current && !confirmRef.current.contains(event.target)) {
                setShowConfirm(false);
            }
        };
        if (showConfirm) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showConfirm]);

    const triggerDownload = async () => {
        setLoading(true);
        try {
            // Direct navigation triggers download via Content-Disposition: attachment
            // Works across all browsers including Chrome
            window.location.href = `${API_URL}/api/company-profile/download/public`;

            setHasDownloaded(true);

            // Trigger the sucking animation
            setAnimating(true);
            setTimeout(() => setAnimating(false), 800);
        } catch (error) {
            console.error("Error downloading profile:", error);
            alert("There was an error downloading the company profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (loading) return;
        if (hasDownloaded) {
            setShowConfirm(true);
            return;
        }
        triggerDownload();
    };

    const confirmReDownload = () => {
        setShowConfirm(false);
        triggerDownload();
    };

    // ── Sucking animation overlay ────────────────────────────────────────
    const SuckAnimation = () => {
        if (!animating) return null;
        return (
            <div className="fixed inset-0 z-[9999] pointer-events-none">
                {/* Radial shrink effect overlay */}
                <div
                    className="absolute inset-0 bg-white/80 backdrop-blur-sm"
                    style={{
                        animation: "suckFade 0.8s ease-in-out forwards",
                    }}
                />
                {/* Flying document icon */}
                <div
                    className="absolute"
                    style={{
                        animation: "suckFly 0.8s ease-in-out forwards",
                    }}
                >
                    <div className="bg-blue-500 text-white p-3 rounded-lg shadow-2xl">
                        <FileText size={24} />
                    </div>
                </div>
                <style>{`
                    @keyframes suckFade {
                        0% { opacity: 0; }
                        30% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                    @keyframes suckFly {
                        0% {
                            left: 50%;
                            top: 50%;
                            transform: translate(-50%, -50%) scale(2);
                            opacity: 1;
                        }
                        100% {
                            left: calc(100% - 60px);
                            top: 10px;
                            transform: translate(0, 0) scale(0);
                            opacity: 0;
                        }
                    }
                    @media (max-width: 768px) {
                        @keyframes suckFly {
                            0% {
                                left: 50%;
                                top: 50%;
                                transform: translate(-50%, -50%) scale(2);
                                opacity: 1;
                            }
                            100% {
                                left: 50%;
                                top: calc(100% - 30px);
                                transform: translate(-50%, 0) scale(0);
                                opacity: 0;
                            }
                        }
                    }
                `}</style>
            </div>
        );
    };

    // ── Re-download confirm dialog ────────────────────────────────────
    const ConfirmDialog = () => {
        if (!showConfirm) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <div ref={confirmRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-6 text-center">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-blue-600" size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Already Downloaded</h3>
                        <p className="text-gray-500 text-sm">
                            You've already downloaded the company profile. Would you like to download it again?
                        </p>
                    </div>
                    <div className="flex border-t border-gray-100">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmReDownload}
                            className="flex-1 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors border-l border-gray-100"
                        >
                            Download Again
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Compact version for Navbar ──────────────────────────────────────────
    if (compact) {
        return (
            <>
                <SuckAnimation />
                <ConfirmDialog />
                <button
                    id="download-company-profile-btn-nav"
                    onClick={handleDownload}
                    disabled={loading}
                    title="Download Company Profile PDF"
                    aria-label="Download Company Profile"
                    className="group flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                    ) : (
                        <Download className="w-4 h-4 flex-shrink-0 group-hover:translate-y-0.5 transition-transform duration-200" />
                    )}
                    <span>{loading ? "Downloading..." : "Profile"}</span>
                </button>
            </>
        );
    }

    // ── Full version for Contact page ────────────────────────────────────────
    return (
        <>
            <SuckAnimation />
            <ConfirmDialog />
            <div className="text-center mt-6">
                <button
                    id="download-company-profile-btn"
                    onClick={handleDownload}
                    disabled={loading}
                    className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/30 hover:shadow-xl hover:shadow-blue-300 dark:hover:shadow-blue-800/40 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    aria-label="Download Company Profile PDF"
                >
                    {/* Sheen effect */}
                    <span className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700 skew-x-12 pointer-events-none"></span>

                    {/* Icon */}
                    <span className="relative w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <FileText className="w-5 h-5" />
                        )}
                    </span>

                    {/* Text */}
                    <span className="relative flex flex-col text-left">
                        <span className="text-[10px] font-normal uppercase tracking-widest text-blue-100 group-hover:text-white transition-colors leading-none mb-0.5">
                            Download Free
                        </span>
                        <span className="text-base leading-tight">
                            {loading ? "Downloading..." : "Company Profile"}
                        </span>
                    </span>

                    {/* Arrow */}
                    <Download className={`w-5 h-5 ml-1 flex-shrink-0 transition-transform duration-300 ${loading ? "opacity-0" : "group-hover:translate-y-0.5"}`} />
                </button>

                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                    Professional PDF  •  No sign-up required
                </p>
            </div>
        </>
    );
};

export default DownloadProfileButton;
