import React, { createContext, useState, useEffect, useContext } from "react";

const SettingsContext = createContext(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    // Theme state
    const [themeMode, setThemeMode] = useState(() => {
        return localStorage.getItem("themeMode") || "system";
    });

    // Vision mode state
    const [visionMode, setVisionMode] = useState(() => {
        return localStorage.getItem("visionMode") || "default";
    });

    // Apply theme mode
    useEffect(() => {
        const applyTheme = () => {
            const root = window.document.documentElement;
            root.classList.remove("dark");

            if (themeMode === "dark") {
                root.classList.add("dark");
            } else if (themeMode === "system") {
                const systemPrefersDark = window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;
                if (systemPrefersDark) {
                    root.classList.add("dark");
                }
            }
            localStorage.setItem("themeMode", themeMode);
        };

        applyTheme();

        // Listen for system changes if system mode is selected
        if (themeMode === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            const handleChange = () => applyTheme();
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        }
    }, [themeMode]);

    // Apply vision mode
    useEffect(() => {
        const body = window.document.body;

        // Remove all existing vision classes
        body.classList.remove(
            "vision-blurred",
            "vision-reduced-contrast",
            "vision-protanopia",
            "vision-deuteranopia",
            "vision-tritanopia",
            "vision-achromatopsia"
        );

        if (visionMode !== "default") {
            body.classList.add(`vision-${visionMode}`);
        }

        localStorage.setItem("visionMode", visionMode);
    }, [visionMode]);

    const value = {
        themeMode,
        setThemeMode,
        visionMode,
        setVisionMode,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};
