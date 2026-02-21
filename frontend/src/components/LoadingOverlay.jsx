import React from "react";
import { useLoading } from "../context/LoadingContext";
import { useLocation } from "react-router-dom";
import PageLoader from "./PageLoader";

const LoadingOverlay = () => {
  const { isLoading } = useLoading();
  const location = useLocation();

  // Don't show overlay on admin pages as they have their own skeleton loaders
  const isAdminPage = location.pathname.startsWith("/admin");

  // Components handle their own PageLoader locally. A global overlay
  // creates jarring full-page flashes or layout shifts when switching pages.
  return null;
};

export default LoadingOverlay;
