import React, { StrictMode } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./layouts/Layout";
import AdminLayout from "./layouts/AdminLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import { About, Services, Projects, Contact, Resources } from "./pages/Pages";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import AboutEditor from "./pages/admin/cms/AboutEditor";
import ContactEditor from "./pages/admin/cms/ContactEditor";
import ServiceManager from "./pages/admin/cms/ServiceManager";
import ProjectManager from "./pages/admin/cms/ProjectManager";
import AdminInquiries from "./pages/admin/cms/AdminInquiries";
import UserManager from "./pages/admin/system/UserManager";
import RoleManager from "./pages/admin/system/RoleManager";
import ResourceManager from "./pages/admin/system/ResourceManager";

import { LoadingProvider } from "./context/LoadingContext";
import LoadingOverlay from "./components/LoadingOverlay";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <LoadingProvider>
      <LoadingOverlay />
      <AuthProvider>
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

          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<ResourceManager />} />
              <Route path="about" element={<AboutEditor />} />
              <Route path="contact" element={<ContactEditor />} />
              <Route path="services" element={<ServiceManager />} />
              <Route path="projects" element={<ProjectManager />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              <Route path="resources" element={<ResourceManager />} />
              <Route path="roles" element={<RoleManager />} />
              <Route path="users" element={<UserManager />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </LoadingProvider>
  );
}

export default App;
