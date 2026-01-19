import React, { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
import { Plus, Trash2, Edit2, X, Truck, MapPin, Loader2 } from 'lucide-react';

const ResourceManager = () => {
    const [activeTab, setActiveTab] = useState('machinery'); // 'machinery' or 'sites'
    const [showPlateNumbers, setShowPlateNumbers] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axiosClient.get('/api/page-contents?page=resources', { skipLoading: true });
            const settings = response.data.find(item => item.section_name === 'display_settings');
            if (settings) {
                const config = JSON.parse(settings.content);
                setShowPlateNumbers(config.show_plate_numbers);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const togglePlateNumbers = async () => {
        const newValue = !showPlateNumbers;
        setShowPlateNumbers(newValue);
        try {
            await axiosClient.post('/api/page-contents', {
                page_name: 'resources',
                section_name: 'display_settings',
                content: JSON.stringify({ show_plate_numbers: newValue })
            }, { skipLoading: true });
        } catch (error) {
            console.error('Error saving settings:', error);
            setShowPlateNumbers(!newValue); // Revert on error
        }
    };
    
    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Resources</h2>
                
                {/* Global Settings Toggle */}
                {activeTab === 'machinery' && (
                    <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-lg">
                        <div className="relative">
                            <button 
                                className="text-gray-500 hover:text-blue-600 transition-colors"
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                                onClick={() => setShowTooltip(!showTooltip)}
                            >
                                <Truck size={20} />
                            </button>
                            {showTooltip && (
                                <div className="absolute right-0 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs p-3 rounded shadow-lg z-10">
                                    <strong>Public View Setting:</strong><br/>
                                    If ON: Public sees all non-decommissioned vehicles with plate numbers.<br/>
                                    If OFF: Public sees only unique models (grouped) without plate numbers.
                                    <div className="absolute bottom-0 right-2 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${!showPlateNumbers ? 'text-blue-600' : 'text-gray-500'}`}>Summary View</span>
                            <button 
                                onClick={togglePlateNumbers}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out ${showPlateNumbers ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${showPlateNumbers ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                            <span className={`text-sm font-medium ${showPlateNumbers ? 'text-blue-600' : 'text-gray-500'}`}>Detailed View</span>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="flex gap-4 mb-6 border-b">
                <button 
                    onClick={() => setActiveTab('machinery')}
                    className={`pb-2 px-4 flex items-center gap-2 font-medium ${activeTab === 'machinery' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Truck size={20} /> Heavy Equipment Fleet
                </button>
                <button 
                    onClick={() => setActiveTab('sites')}
                    className={`pb-2 px-4 flex items-center gap-2 font-medium ${activeTab === 'sites' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <MapPin size={20} /> Land Development Sites
                </button>
            </div>

            {activeTab === 'machinery' ? <MachineryList /> : <SiteList />}
        </div>
    );
};

const MachineryList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        plate_number: '',
        is_decommissioned: false,
        image_url: ''
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/api/machineries', { skipLoading: true });
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching machinery:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await axiosClient.put(`/api/machineries/${editingItem.id}`, formData, { skipLoading: true });
            } else {
                await axiosClient.post('/api/machineries', formData, { skipLoading: true });
            }
            fetchItems();
            closeModal();
        } catch (error) {
            console.error('Error saving machinery:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axiosClient.delete(`/api/machineries/${id}`, { skipLoading: true });
                fetchItems();
            } catch (error) {
                console.error('Error deleting machinery:', error);
            }
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                type: item.type,
                plate_number: item.plate_number || '',
                is_decommissioned: item.is_decommissioned,
                image_url: item.image_url || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                type: '',
                plate_number: '',
                is_decommissioned: false,
                image_url: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    if (loading && items.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    <Plus size={20} /> Add Equipment
                </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map(item => (
                    <div key={item.id} className={`bg-white p-4 rounded-lg shadow border-l-4 ${item.is_decommissioned ? 'border-red-500' : 'border-green-500'}`}>
                        {item.image_url && (
                            <img 
                                src={item.image_url.startsWith('http') ? item.image_url : `${import.meta.env.VITE_API_URL}/storage/${item.image_url}`} 
                                alt={item.name} 
                                className="w-full h-32 object-cover rounded mb-2"
                            />
                        )}
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-lg">{item.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded ${item.is_decommissioned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                {item.is_decommissioned ? 'Decommissioned' : 'Active'}
                            </span>
                        </div>
                        <p className="text-gray-600 text-sm">Type: {item.type}</p>
                        <p className="text-gray-600 text-sm mb-4">Plate: {item.plate_number || 'N/A'}</p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800 p-1">
                                <Edit2 size={18} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{editingItem ? 'Edit Equipment' : 'Add Equipment'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Plate Number</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.plate_number} onChange={e => setFormData({...formData, plate_number: e.target.value})} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                            </div>
                            <div className="mb-4 flex items-center gap-2">
                                <input type="checkbox" id="decommissioned" checked={formData.is_decommissioned} onChange={e => setFormData({...formData, is_decommissioned: e.target.checked})} />
                                <label htmlFor="decommissioned" className="text-sm font-medium">Decommissioned</label>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const SiteList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: '',
        description: '',
        image_url: ''
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/api/development-sites', { skipLoading: true });
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching sites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await axiosClient.put(`/api/development-sites/${editingItem.id}`, formData, { skipLoading: true });
            } else {
                await axiosClient.post('/api/development-sites', formData, { skipLoading: true });
            }
            fetchItems();
            closeModal();
        } catch (error) {
            console.error('Error saving site:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await axiosClient.delete(`/api/development-sites/${id}`, { skipLoading: true });
                fetchItems();
            } catch (error) {
                console.error('Error deleting site:', error);
            }
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                location: item.location,
                capacity: item.capacity,
                description: item.description || '',
                image_url: item.image_url || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                location: '',
                capacity: '',
                description: '',
                image_url: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    if (loading && items.length === 0) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    <Plus size={20} /> Add Site
                </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {items.map(item => (
                    <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden group">
                        {item.image_url && (
                            <img 
                                src={item.image_url.startsWith('http') ? item.image_url : `${import.meta.env.VITE_API_URL}/storage/${item.image_url}`} 
                                alt={item.name} 
                                className="w-full h-48 object-cover"
                            />
                        )}
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-1">{item.name}</h3>
                            <p className="text-gray-500 mb-2">{item.location}</p>
                            <p className="text-green-600 font-semibold mb-2">{item.capacity}</p>
                            <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                            <div className="flex justify-end gap-2">
                                <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800 p-1">
                                    <Edit2 size={18} />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 p-1">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{editingItem ? 'Edit Site' : 'Add Site'}</h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Site Name</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Location</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Capacity</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea className="w-full p-2 border rounded h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                                <input type="text" className="w-full p-2 border rounded" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={closeModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResourceManager;
