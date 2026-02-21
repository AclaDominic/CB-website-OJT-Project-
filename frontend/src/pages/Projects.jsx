import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import { Toaster, toast } from "react-hot-toast";
import ProjectGalleryModal from "../components/ProjectGalleryModal";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/api/projects?public=true");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleProjectClick = (project) => {
    if (project.before_afters && project.before_afters.length > 0) {
      setSelectedProject(project);
      setIsModalOpen(true);
    } else {
      toast("No 'Before & After' gallery images available for this project.", {
        icon: "ℹ️",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  const completedProjects = projects.filter(
    (p) => p.status.toLowerCase() === "completed",
  );
  const ongoingProjects = projects.filter(
    (p) => p.status.toLowerCase() === "ongoing",
  );

  return (
    <div className="font-sans pt-20">
      <Toaster position="bottom-center" />
      <ProjectGalleryModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      <div className="bg-gray-900 py-16 text-center text-white">
        <h1 className="text-4xl font-bold mb-2">Our Projects</h1>
        <p className="text-gray-400">
          Delivering Excellence Across Infrastructures
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-company-blue mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Ongoing Projects */}
            {ongoingProjects.length > 0 && (
              <div className="mb-20">
                <div className="flex items-center mb-12">
                  <div className="h-px bg-gray-300 flex-grow"></div>
                  <h2 className="text-2xl font-bold text-gray-800 px-6 uppercase tracking-wider">
                    Ongoing Projects
                  </h2>
                  <div className="h-px bg-gray-300 flex-grow"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ongoingProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => handleProjectClick(project)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Projects */}
            <div>
              <div className="flex items-center mb-12">
                <div className="h-px bg-gray-300 flex-grow"></div>
                <h2 className="text-2xl font-bold text-gray-800 px-6 uppercase tracking-wider">
                  Completed Projects
                </h2>
                <div className="h-px bg-gray-300 flex-grow"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {completedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => handleProjectClick(project)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
  >
    <div className="h-56 bg-gray-200 relative overflow-hidden">
      <img
        src={
          project.image
            ? project.image.startsWith("http")
              ? project.image
              : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${project.image}`
            : "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        }
        alt={project.name}
        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
      />

      {/* Gallery Badge */}
      {project.before_afters && project.before_afters.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          Gallery
        </div>
      )}

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-company-dark shadow-sm">
        {project.year}
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-company-blue transition-colors">
        {project.name}
      </h3>
      <div className="flex items-center text-gray-500 text-sm mb-4">
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {project.location}
      </div>
      <div className="border-t border-gray-100 pt-4">
        <p className="text-xs text-gray-400 uppercase font-semibold mb-1">
          Scope of Work
        </p>
        <p className="text-gray-700 text-sm line-clamp-2">{project.scope}</p>
      </div>
    </div>
  </div>
);

export default Projects;
