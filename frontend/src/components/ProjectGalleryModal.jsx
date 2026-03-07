import React from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * ProjectGalleryModal
 * Displays a modal with project details and a carousel/list of Before & After images.
 *
 * Props:
 * - project: The project object (must include before_afters)
 * - isOpen: Boolean to control visibility
 * - onClose: Function to close the modal
 */
const ProjectGalleryModal = ({ project, isOpen, onClose }) => {
  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex justify-between items-start p-4 md:p-6 border-b border-gray-100">
          <div className="pr-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {project.name}
            </h2>
            <p className="text-gray-500 text-sm flex flex-wrap items-center gap-2 mt-1">
              <span className="font-medium">{project.location}</span>
              <span className="hidden md:inline">•</span>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase">
                {project.year}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {/* Scope of Work */}
          <div className="mb-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Scope of Work
            </h3>
            <p className="text-gray-700 leading-relaxed">{project.scope}</p>
          </div>

          {/* Gallery Grid */}
          <div className="space-y-12">
            {project.before_afters && project.before_afters.length > 0 ? (
              project.before_afters.map((item, index) => (
                <div key={item.id || index} className="space-y-3">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-200 px-3 py-1 rounded-full">
                      Transformation {index + 1}
                    </span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Before Image */}
                    <div className="group relative rounded-xl overflow-hidden shadow-md bg-white border border-gray-100">
                      <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-wide z-10">
                        Before
                      </div>
                      <img
                        src={
                          item.before_image?.startsWith("http")
                            ? item.before_image
                            : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${item.before_image}`
                        }
                        alt={`Before - ${project.name} ${index + 1}`}
                        loading="lazy"
                        className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>

                    {/* After Image */}
                    <div className="group relative rounded-xl overflow-hidden shadow-md bg-white border border-gray-100">
                      <div className="absolute top-4 left-4 bg-company-blue/90 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md uppercase tracking-wide z-10 shadow-lg">
                        After
                      </div>
                      <img
                        src={
                          item.after_image?.startsWith("http")
                            ? item.after_image
                            : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/storage/${item.after_image}`
                        }
                        alt={`After - ${project.name} ${index + 1}`}
                        loading="lazy"
                        className="w-full h-64 md:h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No gallery images available for this project.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
          >
            Close Gallery
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectGalleryModal;
