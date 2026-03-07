import React from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';

const Home = () => {
    return (
        <div className="w-full font-sans">
            <HeroCarousel />

            {/* Why Choose Us Section (Keeping previous section for content completeness) */}
            <section className="py-20 bg-white dark:!bg-gray-900 transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-12 text-gray-800 dark:text-white">Why Choose Cliberduche?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 bg-white dark:!bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 text-left">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6 text-blue-600 dark:text-blue-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Quality</h3>
                            <p className="text-gray-600 dark:text-gray-300">High-quality projects aligned with national and local standards.</p>
                        </div>
                        <div className="p-8 bg-white dark:!bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 text-left">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6 text-green-600 dark:text-green-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Safety</h3>
                            <p className="text-gray-600 dark:text-gray-300">Strict safety practices before, during, and after project execution.</p>
                        </div>
                        <div className="p-8 bg-white dark:!bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 text-left">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6 text-blue-600 dark:text-blue-300">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Integrity</h3>
                            <p className="text-gray-600 dark:text-gray-300">Compliance with construction laws, reliability, and timely delivery.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
