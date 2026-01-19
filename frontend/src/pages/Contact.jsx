import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Facebook, Linkedin, Instagram, Twitter, Youtube, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

export const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('');
    const [officeInfo, setOfficeInfo] = useState({});

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await api.get('/api/page-contents?page=contact');
                const data = response.data;
                const info = data.find(item => item.section_name === 'office_info');
                if (info) {
                    try {
                        const parsed = JSON.parse(info.content);
                        // Normalize data structure for backward compatibility
                        setOfficeInfo({
                            address: parsed.address || '',
                            email: typeof parsed.email === 'string' ? { value: parsed.email, visible: true } : (parsed.email || { value: '', visible: true }),
                            mobile: typeof parsed.mobile === 'string' ? { value: parsed.mobile, visible: true } : (parsed.mobile || { value: '', visible: true }),
                            landline: typeof parsed.landline === 'string' ? { value: parsed.landline, visible: false } : (parsed.landline || { value: '', visible: false }),
                            socials: Array.isArray(parsed.socials) ? parsed.socials : []
                        });
                    } catch (e) {
                        // Fallback for legacy text
                        setOfficeInfo({ 
                            address: info.content,
                            email: { value: '', visible: true },
                            mobile: { value: '', visible: true },
                            landline: { value: '', visible: false },
                            socials: []
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching content:', error);
            }
        };
        fetchContent();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        try {
            await api.post('/inquiries', formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    const getSocialIcon = (platform) => {
        switch (platform) {
            case 'facebook': return <Facebook className="w-5 h-5" />;
            case 'linkedin': return <Linkedin className="w-5 h-5" />;
            case 'instagram': return <Instagram className="w-5 h-5" />;
            case 'twitter': return <Twitter className="w-5 h-5" />;
            case 'youtube': return <Youtube className="w-5 h-5" />;
            case 'whatsapp': return <MessageCircle className="w-5 h-5" />;
            case 'viber': return <Phone className="w-5 h-5" />;
            default: return <MessageCircle className="w-5 h-5" />;
        }
    };

    const getSocialColor = (platform) => {
        switch (platform) {
            case 'facebook': return 'bg-blue-100 text-blue-600 hover:bg-blue-200';
            case 'linkedin': return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
            case 'instagram': return 'bg-pink-100 text-pink-600 hover:bg-pink-200';
            case 'twitter': return 'bg-sky-100 text-sky-500 hover:bg-sky-200';
            case 'youtube': return 'bg-red-100 text-red-600 hover:bg-red-200';
            case 'whatsapp': return 'bg-green-100 text-green-600 hover:bg-green-200';
            case 'viber': return 'bg-purple-100 text-purple-600 hover:bg-purple-200';
            default: return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
        }
    };

    return (
        <div className="font-sans pt-20">
            <div className="bg-company-blue py-16 text-center text-white">
                <h1 className="text-4xl font-bold mb-2">Contact Us</h1>
                <p className="text-blue-100">Get in touch for quotations and inquiries.</p>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12">

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Send us a Message</h2>
                        {status === 'success' && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                                Message sent successfully! We will get back to you soon.
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                Something went wrong. Please try again.
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full bg-company-blue hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md disabled:opacity-50"
                            >
                                {status === 'sending' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold mb-8 text-gray-800">Office Information</h2>
                            
                            {/* Address */}
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Our Office</h3>
                                    <p className="text-gray-600 whitespace-pre-line">{officeInfo.address || 'Loading...'}</p>
                                </div>
                            </div>

                            {/* Email */}
                            {officeInfo.email?.visible && officeInfo.email?.value && (
                                <div className="flex items-start gap-4">
                                    <div className="bg-green-100 p-3 rounded-lg text-green-600">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                                        <p className="text-gray-600">{officeInfo.email.value}</p>
                                    </div>
                                </div>
                            )}

                            {/* Phone */}
                            {(officeInfo.mobile?.visible || officeInfo.landline?.visible) && (
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                                        {officeInfo.mobile?.visible && officeInfo.mobile?.value && (
                                            <p className="text-gray-600">{officeInfo.mobile.value}</p>
                                        )}
                                        {officeInfo.landline?.visible && officeInfo.landline?.value && (
                                            <p className="text-gray-600">{officeInfo.landline.value}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Social Media */}
                            {officeInfo.socials && officeInfo.socials.some(s => s.visible && s.value) && (
                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-4">Connect With Us</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {officeInfo.socials.filter(s => s.visible && s.value).map((social, index) => (
                                            <a 
                                                key={index}
                                                href={social.value.startsWith('http') ? social.value : `https://${social.value}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-3 rounded-lg transition-colors ${getSocialColor(social.platform)}`}
                                                title={social.platform}
                                            >
                                                {getSocialIcon(social.platform)}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
