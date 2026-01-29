'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';

interface VisitType {
    id: string;
    code: string;
    name: string;
    description: string;
    defaultDuration: number;
    requiresApproval: boolean;
    priority: number;
    isActive: boolean;
    usageCount: number;
}

export default function VisitTypesMasterPage() {

    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState<VisitType | null>(null);

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        defaultDuration: 30,
        requiresApproval: false,
        priority: 1,
        isActive: true,
    });

    const fetchVisitTypes = useCallback(() => apiClient.get('/visit-types') as Promise<{ data: VisitType[] }>, []);
    const { data: visitTypesData, loading, refetch } = useApiQuery<{ data: VisitType[] }>(
        fetchVisitTypes,
        { refetchOnMount: true }
    );

    const visitTypes = visitTypesData?.data || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingType) {
                await apiClient.put(`/visit-types/${editingType.id}`, formData);
            } else {
                await apiClient.post('/visit-types', formData);
            }

            refetch();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving visit type:', error);
            alert('Error saving visit type');
        }
    };

    const handleEdit = (type: VisitType) => {
        setEditingType(type);
        setFormData({
            code: type.code,
            name: type.name,
            description: type.description,
            defaultDuration: type.defaultDuration,
            requiresApproval: type.requiresApproval,
            priority: type.priority,
            isActive: type.isActive,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this visit type?')) return;

        try {
            await apiClient.delete(`/visit-types/${id}`);
            refetch();
        } catch (error) {
            console.error('Error deleting visit type:', error);
            alert('Error deleting visit type');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingType(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            defaultDuration: 30,
            requiresApproval: false,
            priority: 1,
            isActive: true,
        });
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Visit Types Master</h1>
                <p className="text-gray-600">Manage visit categories and their configurations</p>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex justify-end">
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Add Visit Type
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : visitTypes.length === 0 ? (
                            <tr>
                                <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                                    No visit types found
                                </td>
                            </tr>
                        ) : (
                            visitTypes.map((type) => (
                                <tr key={type.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium">{type.code}</td>
                                    <td className="px-6 py-4 text-sm">{type.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{type.description}</td>
                                    <td className="px-6 py-4 text-sm">{type.defaultDuration} min</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                                            P{type.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {type.requiresApproval ? (
                                            <span className="text-orange-600">Required</span>
                                        ) : (
                                            <span className="text-gray-400">Not required</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{type.usageCount || 0}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${type.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {type.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm space-x-2">
                                        <button
                                            onClick={() => handleEdit(type)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(type.id)}
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
                            {editingType ? 'Edit Visit Type' : 'Add Visit Type'}
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
                                        placeholder="e.g., ROUTINE_CHECK"
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
                                        placeholder="e.g., Routine Check"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">Description*</label>
                                    <textarea
                                        required
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        rows={2}
                                        placeholder="Purpose of this visit type"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Default Duration (minutes)*</label>
                                    <input
                                        type="number"
                                        required
                                        min="5"
                                        value={formData.defaultDuration}
                                        onChange={(e) => setFormData({ ...formData, defaultDuration: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Priority*</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="1">P1 - Critical</option>
                                        <option value="2">P2 - High</option>
                                        <option value="3">P3 - Medium</option>
                                        <option value="4">P4 - Low</option>
                                    </select>
                                </div>

                                <div className="col-span-2 space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.requiresApproval}
                                            onChange={(e) => setFormData({ ...formData, requiresApproval: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium">Requires Approval</span>
                                    </label>

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
                                    {editingType ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
