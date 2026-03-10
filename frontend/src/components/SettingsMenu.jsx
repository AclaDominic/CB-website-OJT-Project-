import React, { useState, useRef, useEffect } from "react";
import { useSettings } from "../context/SettingsContext";

const SettingsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { themeMode, setThemeMode, visionMode, setVisionMode } = useSettings();
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const visionOptions = [
        { value: "default", label: "No Emulation (Default)" },
        { value: "blurred", label: "Blurred Vision" },
        { value: "reduced-contrast", label: "Reduced Contrast" },
        { value: "protanopia", label: "Protanopia (No Red)" },
        { value: "deuteranopia", label: "Deuteranopia (No Green)" },
        { value: "tritanopia", label: "Tritanopia (No Blue)" },
        { value: "achromatopsia", label: "Achromatopsia (No Color)" },
    ];

    const themeOptions = [
        { value: "light", label: "Light Mode", icon: "☀️" },
        { value: "dark", label: "Dark Mode", icon: "🌙" },
        { value: "system", label: "System Mode", icon: "💻" },
    ];

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center p-2 text-gray-600 hover:text-company-blue dark:text-gray-300 dark:hover:text-blue-400 bg-gray-100 hover:bg-gray-200 dark:!bg-gray-800 dark:hover:bg-gray-700 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-company-blue"
                aria-label="Accessibility & Theme Settings"
                aria-expanded={isOpen}
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    ></path>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                </svg>
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:!bg-gray-800 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-4 bg-blue-50 dark:!bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <span className="text-xl">♿</span> Accessibility & Themes
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Our interface supports accessibility vision modes and themes to ensure the experience is fair and comfortable for all users.
                        </p>
                    </div>

                    <div className="py-2">
                        {/* Vision Mode Section */}
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                            <label htmlFor="vision-mode" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Vision Accessibility
                            </label>
                            <select
                                id="vision-mode"
                                value={visionMode}
                                onChange={(e) => setVisionMode(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-company-blue focus:border-company-blue block p-2 dark:!bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                            >
                                {visionOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Theme Mode Section */}
                        <div className="px-4 py-3">
                            <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Theme Mode
                            </span>
                            <div className="flex gap-2 bg-gray-100 dark:!bg-gray-700/50 p-1 rounded-lg">
                                {themeOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setThemeMode(opt.value)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md flex flex-col items-center justify-center gap-1 transition-all
                      ${themeMode === opt.value
                                                ? "bg-white dark:!bg-gray-800 text-company-blue shadow-sm ring-1 ring-gray-200 dark:ring-gray-600"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                            }`}
                                    >
                                        <span>{opt.icon}</span>
                                        <span className="sr-only">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsMenu;
