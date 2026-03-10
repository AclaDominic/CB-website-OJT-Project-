import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import SettingsMenu from './SettingsMenu';
import DownloadProfileButton from './DownloadProfileButton';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about-us' },
        { name: 'Services', path: '/services' },
        { name: 'Projects', path: '/projects' },
        { name: 'Resources', path: '/resources' },
        { name: 'Contact', path: '/contact-us' },
    ];

    return (
        <nav className="bg-white dark:!bg-gray-800 sticky top-0 z-50 shadow-sm font-sans transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <img src={logo} alt="Cliberduche Corporation Logo" className="h-16 md:h-20 lg:h-24" />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors text-base"
                            >
                                {item.name}
                            </Link>
                        ))}
                        {/* Download Company Profile button */}
                        <DownloadProfileButton compact />
                        <SettingsMenu />
                        <Link
                            to="/login"
                            className="bg-gradient-to-r from-blue-400 to-green-500 hover:from-blue-500 hover:to-green-600 text-white font-medium py-2 px-6 rounded shadow-md transition-all transform hover:scale-105 ml-4"
                        >
                            Client Login
                        </Link>
                    </div>

                    {/* Mobile Button and Settings */}
                    <div className="-mr-2 flex items-center gap-2 md:hidden">
                        <SettingsMenu />
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 dark:text-gray-300 p-2 focus:outline-none">
                            <span className="sr-only">Open menu</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:!bg-gray-800 shadow-lg absolute w-full z-40 transition-colors duration-200">
                    <div className="px-5 pt-4 pb-6 space-y-2">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-company-blue dark:hover:text-company-blue hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        {/* Mobile Download Button */}
                        <div className="pt-2">
                            <DownloadProfileButton compact />
                        </div>
                        <Link
                            to="/login"
                            className="block w-full text-center bg-gradient-to-r from-blue-400 to-green-500 text-white font-medium py-3 rounded mt-4"
                            onClick={() => setIsOpen(false)}
                        >
                            Client Login
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};
export default Navbar;
