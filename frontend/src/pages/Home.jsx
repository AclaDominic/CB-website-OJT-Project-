import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="w-full font-sans">
            {/* Hero Section */}
            <div className="relative h-[85vh] flex items-center">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                        alt="Construction Site"
                        className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay: Blue/White to Transparent/Greenish */}
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-100/90 via-sky-50/80 to-green-100/40"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl md:text-7xl font-bold text-gray-800 leading-tight mb-6">
                            Building <br />
                            Excellence, <br />
                            Constructing <br />
                            Tomorrow
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
                            Cliberduche Corporation is a premier construction company committed to delivering exceptional quality, innovation, and sustainability in every project we undertake.
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
                                className="bg-transparent border-2 border-blue-400 text-blue-500 hover:bg-blue-50 font-bold py-4 px-8 rounded text-lg text-center transition-all"
                            >
                                Get a Quote
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Why Choose Us Section (Keeping previous section for content completeness) */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-12 text-gray-800">Why Choose Cliberduche?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 text-left">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Quality</h3>
                            <p className="text-gray-600">High-quality projects aligned with national and local standards.</p>
                        </div>
                        <div className="p-8 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 text-left">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 text-green-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Safety</h3>
                            <p className="text-gray-600">Strict safety practices before, during, and after project execution.</p>
                        </div>
                        <div className="p-8 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 text-left">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900">Integrity</h3>
                            <p className="text-gray-600">Compliance with construction laws, reliability, and timely delivery.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
