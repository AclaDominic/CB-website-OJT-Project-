import React, { StrictMode, Suspense, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import SystemLayout from "./layouts/SystemLayout";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/LoadingOverlay";
import ScrollToTop from "./components/ScrollToTop";
import DynamicTitle from "./components/DynamicTitle";
import PageLoader from "./components/PageLoader";

import { SettingsProvider } from "./context/SettingsContext";
import AccessibilityFilters from "./components/AccessibilityFilters";

// Need to import the clear cache function
import { clearCache } from "./lib/axios";

// Lazy Loaded Pages
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const LazyAbout = React.lazy(() => import("./pages/About"));
const LazyServices = React.lazy(() => import("./pages/Services"));
const LazyProjects = React.lazy(() => import("./pages/Projects"));
const LazyContact = React.lazy(() =>
  import("./pages/Contact").then((module) => ({ default: module.Contact })),
);
const LazyResources = React.lazy(() => import("./pages/Resources"));

// CMS Pages
const AboutEditor = React.lazy(() => import("./pages/system/cms/AboutEditor"));
const ContactEditor = React.lazy(
  () => import("./pages/system/cms/ContactEditor"),
);
const FaqManager = React.lazy(() => import("./pages/system/cms/FaqManager"));
const ServiceManager = React.lazy(
  () => import("./pages/system/cms/ServiceManager"),
);
const ProjectManager = React.lazy(
  () => import("./pages/system/cms/ProjectManager"),
);
const SystemInquiries = React.lazy(
  () => import("./pages/system/cms/SystemInquiries"),
);

// System Pages
const UserManager = React.lazy(
  () => import("./pages/system/system/UserManager"),
);
const RoleManager = React.lazy(
  () => import("./pages/system/system/RoleManager"),
);
const ResourceManager = React.lazy(
  () => import("./pages/system/system/ResourceManager"),
);
const InventoryManager = React.lazy(
  () => import("./pages/system/system/InventoryManager"),
);
const ProcurementManager = React.lazy(
  () => import("./pages/system/system/ProcurementManager"),
);
const AccountSettings = React.lazy(
  () => import("./pages/system/system/AccountSettings"),
);
const BackupManager = React.lazy(() => import("./pages/system/BackupManager"));
const Dashboard = React.lazy(() => import("./pages/system/Dashboard"));

const App = () => {
  useEffect(() => {
    // Clear the localStorage API cache when the user closes the tab
    const handleBeforeUnload = () => {
      clearCache();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <SettingsProvider>
      <AccessibilityFilters />
      <LoadingProvider>
        <LoadingOverlay />
        <AuthProvider>
          <DynamicTitle />
          <ScrollToTop />
          <Suspense fallback={<PageLoader fullScreen />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about-us" element={<LazyAbout />} />
                <Route path="services" element={<LazyServices />} />
                <Route path="projects" element={<LazyProjects />} />
                <Route path="resources" element={<LazyResources />} />
                <Route path="contact-us" element={<LazyContact />} />
              </Route>

              <Route path="/login" element={<Login />} />

              <Route path="/system" element={<ProtectedRoute />}>
                <Route element={<SystemLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="about" element={<AboutEditor />} />
                  <Route path="contact" element={<ContactEditor />} />
                  <Route path="faqs" element={<FaqManager />} />
                  <Route path="services" element={<ServiceManager />} />
                  <Route path="projects" element={<ProjectManager />} />
                  <Route path="inquiries" element={<SystemInquiries />} />
                  <Route path="resources" element={<ResourceManager />} />
                  <Route path="inventory" element={<InventoryManager />} />
                  <Route path="procurement" element={<ProcurementManager />} />
                  <Route path="roles" element={<RoleManager />} />
                  <Route path="users" element={<UserManager />} />
                  <Route path="backups" element={<BackupManager />} />
                  <Route path="settings" element={<AccountSettings />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </LoadingProvider>
    </SettingsProvider>
  );
};

export default App;
