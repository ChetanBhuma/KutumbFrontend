'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';

interface Designation {
    id: string;
    code: string;
    name: string;
    department: string;
    level: number;
    description: string;
    isActive: boolean;
    officerCount: number;
}

export default function DesignationsPage() {

    const [showModal, setShowModal] = useState(false);
    const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        department: 'POLICE',
        level: 1,
        description: '',
        isActive: true,
    });

    const departments = ['POLICE', 'ADMIN', 'TECHNICAL', 'SUPPORT'];

    const fetchDesignations = useCallback(() => apiClient.get('/designations', {
        params: { department: filterDepartment || undefined }
    }) as Promise<{ data: Designation[] }>, [filterDepartment]);

    const { data: designationsData, loading, refetch } = useApiQuery<{ data: Designation[] }>(
        fetchDesignations,
        { refetchOnMount: true }
    );

    const designations = designationsData?.data || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingDesignation) {
                await apiClient.put(`/designations/${editingDesignation.id}`, formData);
            } else {
                await apiClient.post('/designations', formData);
            }

            refetch();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving designation:', error);
            alert('Error saving designation');
        }
    };

    const handleEdit = (designation: Designation) => {
        setEditingDesignation(designation);
        setFormData({
            code: designation.code,
            name: designation.name,
            department: designation.department,
            level: designation.level,
            description: designation.description,
            isActive: designation.isActive,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this designation?')) return;

        try {
            await apiClient.delete(`/designations/${id}`);
            refetch();
        } catch (error) {
            console.error('Error deleting designation:', error);
            alert('Error deleting designation');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingDesignation(null);
        setFormData({
            code: '',
            name: '',
            department: 'POLICE',
            level: 1,
            description: '',
            isActive: true,
        });
    };

    const filteredDesignations = designations.filter(designation =>
        designation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        designation.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Designations Master</h1>
                <p className="text-gray-600">Manage officer designations and hierarchies</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Total Designations</div>
                    <div className="text-2xl font-bold">{designations.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Active</div>
                    <div className="text-2xl font-bold text-green-600">
                        {designations.filter(d => d.isActive).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Departments</div>
                    <div className="text-2xl font-bold text-blue-600">
                        {new Set(designations.map(d => d.department)).size}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Total Officers</div>
                    <div className="text-2xl font-bold text-purple-600">
                        {designations.reduce((sum, d) => sum + (d.officerCount || 0), 0)}
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex gap-4">
                <input
                    type="text"
                    placeholder="Search designations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                />
                <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                    ))}
                </select>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Add Designation
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Officers</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : filteredDesignations.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                    No designations found
                                </td>
                            </tr>
                        ) : (
                            filteredDesignations.map((designation) => (
                                <tr key={designation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium">{designation.code}</td>
                                    <td className="px-6 py-4 text-sm">{designation.name}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                                            {designation.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">Level {designation.level}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{designation.description}</td>
                                    <td className="px-6 py-4 text-sm">{designation.officerCount || 0}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${designation.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {designation.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm space-x-2">
                                        <button
                                            onClick={() => handleEdit(designation)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(designation.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                        <h2 className="text-2xl font-bold mb-4">
                            {editingDesignation ? 'Edit Designation' : 'Add Designation'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Code*</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="e.g., INSP"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Name*</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        placeholder="e.g., Inspector"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Department*</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        {departments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Level*</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="10"
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">1 = Highest, 10 = Lowest</p>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Description*</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        rows={2}
                                        placeholder="Role and responsibilities"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingDesignation ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
