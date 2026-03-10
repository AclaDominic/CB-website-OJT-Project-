import React, { useState } from "react";
import { Download, Loader2, FileText } from "lucide-react";
import { generateCompanyProfile } from "../utils/generateCompanyProfile";
import api from "../lib/axios";

const DownloadProfileButton = ({ compact = false }) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            // Fetch all data concurrently
            const [servicesRes, aboutRes, contactRes] = await Promise.allSettled([
                api.get("/api/services"),
                api.get("/api/page-contents?page=about"),
                api.get("/api/page-contents?page=contact"),
            ]);

            const services = servicesRes.status === "fulfilled" ? servicesRes.value.data : [];

            // Parse about content
            const aboutData = aboutRes.status === "fulfilled" ? aboutRes.value.data : [];
            const about = {};
            aboutData.forEach((item) => {
                if (["mission", "vision", "background"].includes(item.section_name)) {
                    about[item.section_name] = item.content;
                }
            });

            // Parse contact content
            const contactData = contactRes.status === "fulfilled" ? contactRes.value.data : [];
            const officeInfo = contactData.find((item) => item.section_name === "office_info");
            let contact = {};
            if (officeInfo) {
                try {
                    const parsed = JSON.parse(officeInfo.content);
                    contact = {
                        address: parsed.address || "",
                        email: parsed.email?.value || parsed.email || "",
                        mobile: parsed.mobile?.value || parsed.mobile || "",
                        landline: parsed.landline?.visible ? (parsed.landline?.value || "") : "",
                    };
                } catch {
                    contact.address = officeInfo.content;
                }
            }

            await generateCompanyProfile({ services, about, contact });
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("There was an error generating the company profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Compact version for Navbar ──────────────────────────────────────────
    if (compact) {
        return (
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
                <span>{loading ? "Generating..." : "Profile"}</span>
            </button>
        );
    }

    // ── Full version for Contact page ────────────────────────────────────────
    return (
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
                        {loading ? "Generating PDF..." : "Company Profile"}
                    </span>
                </span>

                {/* Arrow */}
                <Download className={`w-5 h-5 ml-1 flex-shrink-0 transition-transform duration-300 ${loading ? "opacity-0" : "group-hover:translate-y-0.5"}`} />
            </button>

            <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
                Professional PDF  •  No sign-up required
            </p>
        </div>
    );
};

export default DownloadProfileButton;
