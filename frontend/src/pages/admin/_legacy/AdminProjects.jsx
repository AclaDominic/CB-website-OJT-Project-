import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';

const AdminProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '', year: '', scope: '', status: 'ongoing', image: null });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await api.delete(`/projects/${id}`);
            fetchProjects();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (project) => {
        setEditingId(project.id);
        setFormData({ name: project.name, location: project.location, year: project.year, scope: project.scope, status: project.status, image: null });
        setIsModalOpen(true);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, image: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('location', formData.location);
        data.append('year', formData.year);
        data.append('scope', formData.scope);
        data.append('status', formData.status);
        if (formData.image) {
            data.append('image', formData.image);
        }
        if (editingId) {
            data.append('_method', 'PUT');
        }

        try {
            if (editingId) {
                await api.post(`/projects/${editingId}`, data);
            } else {
                await api.post('/projects', data);
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: '', location: '', year: '', scope: '', status: 'ongoing', image: null });
            fetchProjects();
        } catch (error) {
            console.error(error);
            alert('Error saving project');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-company-dark">Manage Projects</h1>
                <button
                    onClick={() => { setEditingId(null); setFormData({ name: '', location: '', year: '', scope: '', status: 'ongoing', image: null }); setIsModalOpen(true); }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Add Project
                </button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{project.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{project.scope}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleEdit(project)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-900">Delete</button>
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
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Project' : 'Add Project'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Year</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Scope</label>
                                <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.scope} onChange={e => setFormData({ ...formData, scope: e.target.value })} required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
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

export default AdminProjects;
