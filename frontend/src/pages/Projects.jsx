import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import { Toaster, toast } from "react-hot-toast";
import ProjectGalleryModal from "../components/ProjectGalleryModal";
import PageLoader from "../components/PageLoader";
import PublicPageLayout from "../components/PublicPageLayout";
import { MapPin, Briefcase, Calendar } from "lucide-react";

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
    <PublicPageLayout
      title="Our Projects"
      subtitle="Delivering Excellence Across Infrastructures and Strategic Development Solutions"
    >
      <Toaster position="bottom-center" />
      <ProjectGalleryModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {loading ? (
        <PageLoader />
      ) : (
        <>
          {/* Ongoing Projects */}
          {ongoingProjects.length > 0 && (
            <div className="mb-24">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                  Ongoing Projects
                </h2>
                <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
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
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
                Completed Projects
              </h2>
              <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
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
    </PublicPageLayout>
  );
};

const ProjectCard = ({ project, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-white dark:!bg-gray-800 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50 dark:border-gray-700 flex flex-col transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
  >
    <div className="h-64 relative overflow-hidden">
      <img
        src={
          project.image
            ? project.image.startsWith("http")
              ? project.image
              : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${project.image}`
            : "https://images.unsplash.com/photo-1541888946425-d81bb19480c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
        }
        alt={project.name}
        loading="lazy"
        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
      />

      {/* Gallery Badge */}
      {project.before_afters && project.before_afters.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-[#1E3A8A] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <svg
            className="w-4 h-4"
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
          View Gallery
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-4 right-4 bg-white/95 dark:!bg-gray-800/95 backdrop-blur shadow-sm px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 transition-colors">
        {project.status}
      </div>
    </div>

    <div className="p-8 flex flex-col flex-grow">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors duration-200">
          <Calendar size={12} className="mr-1.5" />
          {project.year}
        </div>
        <div className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors duration-200">
          <MapPin size={12} className="mr-1.5" />
          {project.location}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
        {project.name}
      </h3>

      <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-700 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase size={14} className="text-gray-400 dark:text-gray-500" />
          <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest">
            Scope of Work
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 italic transition-colors duration-200">
          {project.scope}
        </p>
      </div>
    </div>
  </div>
);

export default Projects;
