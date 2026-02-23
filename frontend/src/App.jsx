import React, { StrictMode } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import SystemLayout from "./layouts/SystemLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { About, Services, Projects, Contact, Resources } from "./pages/Pages";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import AboutEditor from "./pages/system/cms/AboutEditor";
import ContactEditor from "./pages/system/cms/ContactEditor";
import ServiceManager from "./pages/system/cms/ServiceManager";
import ProjectManager from "./pages/system/cms/ProjectManager";
import SystemInquiries from "./pages/system/cms/SystemInquiries";
import UserManager from "./pages/system/system/UserManager";
import RoleManager from "./pages/system/system/RoleManager";
import ResourceManager from "./pages/system/system/ResourceManager";
import InventoryManager from "./pages/system/system/InventoryManager";

import ProcurementManager from "./pages/system/system/ProcurementManager";
import AccountSettings from "./pages/system/system/AccountSettings";
import BackupManager from "./pages/system/BackupManager";
import Dashboard from "./pages/system/Dashboard";

import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/LoadingOverlay";
import ScrollToTop from "./components/ScrollToTop";

import DynamicTitle from "./components/DynamicTitle";

function App() {
  return (
    <LoadingProvider>
      <LoadingOverlay />
      <AuthProvider>
        <DynamicTitle />
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about-us" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="projects" element={<Projects />} />
            <Route path="resources" element={<Resources />} />
            <Route path="contact-us" element={<Contact />} />
          </Route>

          <Route path="/login" element={<Login />} />

          <Route path="/system" element={<ProtectedRoute />}>
            <Route element={<SystemLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="about" element={<AboutEditor />} />
              <Route path="contact" element={<ContactEditor />} />
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
      </AuthProvider>
    </LoadingProvider>
  );
}

export default App;
