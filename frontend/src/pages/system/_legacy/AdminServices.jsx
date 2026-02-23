import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';

const AdminServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', type: 'primary', image: null });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/services/${id}`);
            fetchServices();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (service) => {
        setEditingId(service.id);
        setFormData({ title: service.title, description: service.description, type: service.type, image: null });
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('type', formData.type);
        if (formData.image) {
            data.append('image', formData.image);
        }
        if (editingId) {
            data.append('_method', 'PUT'); // Laravel method spoofing for form-data PUT
        }

        try {
            if (editingId) {
                await api.post(`/services/${editingId}`, data);
            } else {
                await api.post('/services', data);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ title: '', description: '', type: 'primary', image: null });
            fetchServices();
        } catch (error) {
            console.error(error);
            alert('Error saving service');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-company-dark">Manage Services</h1>
                <button
                    onClick={() => { setEditingId(null); setFormData({ title: '', description: '', type: 'primary', image: null }); setIsModalOpen(true); }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Add Service
                </button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {services.map((service) => (
                                <tr key={service.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{service.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{service.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(service)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(service.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Service' : 'Add Service'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="primary">Primary</option>
                                    <option value="secondary">Secondary</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Image</label>
                                <input type="file" className="mt-1 block w-full" onChange={handleFileChange} />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded">Cancel</button>
                                <button type="submit" className="bg-company-blue text-white px-4 py-2 rounded">{editingId ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;
