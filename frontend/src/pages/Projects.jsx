import React, { useState, useEffect } from "react";
import api from "../lib/axios";
import { Toaster, toast } from "react-hot-toast";
import ProjectGalleryModal from "../components/ProjectGalleryModal";
import PageLoader from "../components/PageLoader";
import bgHeader from "../assets/bg-header-about-us.png";
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
    <div className="font-sans bg-slate-50 overflow-hidden relative min-h-screen">
      <Toaster position="bottom-center" />
      <ProjectGalleryModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/50 to-green-50/80"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[30%] -left-[15%] w-[50%] h-[35%] bg-green-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-[55%] left-[20%] w-[45%] h-[25%] bg-blue-50/50 rounded-full blur-[90px]"></div>
        <div className="absolute bottom-[5%] -right-[5%] w-[55%] h-[30%] bg-green-100/30 rounded-full blur-[110px]"></div>
        <div className="absolute top-[45%] -right-[10%] w-[40%] h-[30%] bg-blue-100/30 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute -bottom-[5%] -left-[10%] w-[40%] h-[25%] bg-blue-100/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[15%] right-[25%] w-[45%] h-[20%] bg-green-50/40 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative w-full h-[280px] sm:h-[340px] lg:h-[390px] xl:h-[440px] flex items-center justify-center overflow-hidden transition-all duration-500">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: `url(${bgHeader})`,
            backgroundPosition: 'center 40%',
            clipPath: 'url(#heroClipPath)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"></div>
          <div className="absolute inset-0 bg-[#0a1128]/30 mix-blend-multiply"></div>
        </div>

        <div className="relative z-20 text-center text-white px-6 max-w-6xl -mt-8 sm:-mt-12 lg:-mt-16 transition-all">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-tight drop-shadow-xl text-white">
            Our Projects
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl font-normal text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md opacity-90">
            Delivering Excellence Across Infrastructures and Strategic Development Solutions
          </p>
        </div>

                {/* Seamless Responsive Border & ClipPath definition */}
        <svg
          className="absolute inset-0 w-full h-full z-10 pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="50%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#8bc34a" />
            </linearGradient>
            <clipPath id="heroClipPath" clipPathUnits="objectBoundingBox">
              <path d="M0,0 L1,0 L1,0.7 Q0.33,1.15 0,0.85 Z" />
            </clipPath>
          </defs>
          <path
            d="M0,85 Q33,115 100,70"
            stroke="url(#curveGradient)"
            strokeWidth="10"
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 relative z-10">
        {loading ? (
          <PageLoader />
        ) : (
          <>
            {/* Ongoing Projects */}
            {ongoingProjects.length > 0 && (
              <div className="mb-24">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Ongoing Projects</h2>
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
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Completed Projects</h2>
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
      </div>
    </div>
  );
};

const ProjectCard = ({ project, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-white rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-50 flex flex-col transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
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
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-sm px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-700 border border-gray-100">
        {project.status}
      </div>
    </div>

    <div className="p-8 flex flex-col flex-grow">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
          <Calendar size={12} className="mr-1.5" />
          {project.year}
        </div>
        <div className="flex items-center text-green-600 bg-green-50 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
          <MapPin size={12} className="mr-1.5" />
          {project.location}
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
        {project.name}
      </h3>

      <div className="mt-auto pt-6 border-t border-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase size={14} className="text-gray-400" />
          <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
            Scope of Work
          </p>
        </div>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 italic">
          {project.scope}
        </p>
      </div>
    </div>
  </div>
);

export default Projects;

