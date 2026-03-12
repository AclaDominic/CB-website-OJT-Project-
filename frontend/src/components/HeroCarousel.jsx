import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause } from "lucide-react";

// Import local assets
import slideVideo from "../assets/38585-418590011_small.mp4";

const HeroCarousel = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const videoRefs = useRef([]);

    // Sample data for the carousel
    const slides = [
        {
            type: "image",
            src: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
            title: "Building\nExcellence,\nConstructing\nTomorrow",
            subtitle: "Cliberduche Corporation is a premier construction company committed to delivering exceptional quality, innovation, and sustainability in every project we undertake.",
            alt: "Construction Site"
        },
        {
            type: "video",
            src: slideVideo,
            title: "Sustainable\nDevelopment,\nLasting\nImpact",
            subtitle: "We leverage cutting-edge technology and sustainable practices to shape the skylines of tomorrow while protecting our environment today.",
            alt: "Drone view of development"
        },
        {
            type: "image",
            src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
            title: "Engineering\nthe Future\nTogether",
            subtitle: "Our team of dedicated professionals ensures strict adherence to safety and quality standards, bringing your vision to reality.",
            alt: "Engineers collaborating"
        }
    ];

    // Navigation handlers
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    // Auto-advance logic
    useEffect(() => {
        let interval;

        // Only auto-advance if it's playing, not hovered, and if it's a video, only advance after a set time or if video ends
        if (isPlaying && !isHovered) {
            // Check if current slide is a video
            const isCurrentVideo = slides[currentSlide].type === "video";

            // If it's a video, let the video's 'ended' event handle the next slide,
            // or we use a longer timeout as a fallback.
            const timeout = isCurrentVideo ? 15000 : 6000;

            interval = setInterval(() => {
                nextSlide();
            }, timeout);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [currentSlide, isPlaying, isHovered, slides]);

    // Video play/pause management
    useEffect(() => {
        // Pause all videos first
        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index !== currentSlide) {
                    video.pause();
                    video.currentTime = 0; // Reset video
                } else if (isPlaying) {
                    video.play().catch(e => console.log("Video auto-play prevented by browser:", e));
                }
            }
        });
    }, [currentSlide, isPlaying]);

    // Media Controls
    const toggleMute = (e) => {
        e.stopPropagation();
        setIsMuted(!isMuted);

        // Apply mute state to current video if it exists
        const currentVideo = videoRefs.current[currentSlide];
        if (currentVideo) {
            currentVideo.muted = !isMuted;
        }
    };

    const togglePlayPause = (e) => {
        e.stopPropagation();
        setIsPlaying(!isPlaying);

        const currentVideo = videoRefs.current[currentSlide];
        if (currentVideo) {
            if (isPlaying) {
                currentVideo.pause();
            } else {
                currentVideo.play().catch(e => console.log(e));
            }
        }
    };

    return (
        <div
            className="relative h-[85vh] flex items-center overflow-hidden font-sans group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slides Container */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                >
                    {/* Media */}
                    {slide.type === "image" ? (
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <img
                                src={slide.src}
                                alt={slide.alt}
                                className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? "scale-105" : "scale-100"
                                    }`}
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 z-0">
                            <video
                                ref={el => videoRefs.current[index] = el}
                                src={slide.src}
                                className="w-full h-full object-cover"
                                loop={false}
                                muted={isMuted}
                                playsInline
                                onEnded={nextSlide}
                            />
                        </div>
                    )}

                    {/* Gradient Overlay: Matches existing Home.jsx overlay and dark mode fix */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-sky-100/90 via-sky-50/80 to-green-100/40 dark:!from-gray-900/95 dark:!via-gray-900/80 dark:!to-gray-800/60 transition-colors duration-200"></div>
                </div>
            ))}

            {/* Content (Overlay) - Always visible but animates slightly on slide change */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div
                    key={currentSlide} // Key change triggers re-render animation
                    className="max-w-3xl animate-in fade-in slide-in-from-bottom-5 duration-700"
                >
                    <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:!text-white leading-tight mb-6 transition-colors duration-200 whitespace-pre-line">
                        {slides[currentSlide].title}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:!text-gray-200 mb-10 leading-relaxed max-w-2xl transition-colors duration-200">
                        {slides[currentSlide].subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/services"
                            className="bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 text-white font-bold py-4 px-8 rounded shadow-lg text-lg text-center transition-all transform hover:scale-105"
                        >
                            Our Services
                        </Link>
                        <Link
                            to="/contact-us"
                            className="bg-transparent border-2 border-blue-400 text-blue-500 hover:bg-blue-50 dark:hover:!bg-blue-900/30 font-bold py-4 px-8 rounded text-lg text-center transition-all"
                        >
                            Get a Quote
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-between px-4 sm:px-8">
                {/* Prev Next Arrows */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-white/30 hover:bg-white/50 dark:bg-black/30 dark:hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-gray-800 dark:text-white transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
                    className="pointer-events-auto w-12 h-12 rounded-full bg-white/30 hover:bg-white/50 dark:bg-black/30 dark:hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-gray-800 dark:text-white transition-all transform hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                    aria-label="Next Slide"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Bottom Controls Bar (Indicators and Video Controls) */}
            <div className="absolute bottom-8 left-0 right-0 z-30 flex flex-col items-center gap-4">

                {/* Video Controls (Only show if current is video) */}
                {slides[currentSlide].type === "video" && (
                    <div className="flex items-center gap-3 animate-in fade-in duration-300">
                        <button
                            onClick={togglePlayPause}
                            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-white flex items-center justify-center transition-all"
                            aria-label={isPlaying ? "Pause Video" : "Play Video"}
                        >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                        </button>
                        <button
                            onClick={toggleMute}
                            className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-white flex items-center justify-center transition-all"
                            aria-label={isMuted ? "Unmute Video" : "Mute Video"}
                        >
                            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                    </div>
                )}

                {/* Indicators */}
                <div className="flex gap-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 rounded-full h-2 ${index === currentSlide
                                ? "w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                                : "w-2 bg-gray-400/50 hover:bg-gray-300/80"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HeroCarousel;
