'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';

interface HealthCondition {
    id: string;
    code: string;
    name: string;
    description: string;
    severity: string;
    requiresSpecialCare: boolean;
    isActive: boolean;
    citizenCount: number;
}

export default function HealthConditionsPage() {

    const [showModal, setShowModal] = useState(false);
    const [editingCondition, setEditingCondition] = useState<HealthCondition | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        severity: 'MEDIUM',
        requiresSpecialCare: false,
        isActive: true,
    });

    const fetchConditions = useCallback(() => apiClient.get('/health-conditions') as Promise<{ data: HealthCondition[] }>, []);
    const { data: conditionsData, loading, refetch } = useApiQuery<{ data: HealthCondition[] }>(
        fetchConditions,
        { refetchOnMount: true }
    );

    const conditions = conditionsData?.data || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingCondition) {
                await apiClient.put(`/health-conditions/${editingCondition.id}`, formData);
            } else {
                await apiClient.post('/health-conditions', formData);
            }

            refetch();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving health condition:', error);
            alert('Error saving health condition');
        }
    };

    const handleEdit = (condition: HealthCondition) => {
        setEditingCondition(condition);
        setFormData({
            code: condition.code,
            name: condition.name,
            description: condition.description,
            severity: condition.severity,
            requiresSpecialCare: condition.requiresSpecialCare,
            isActive: condition.isActive,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this health condition?')) return;

        try {
            await apiClient.delete(`/health-conditions/${id}`);
            refetch();
        } catch (error) {
            console.error('Error deleting health condition:', error);
            alert('Error deleting health condition');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCondition(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            severity: 'MEDIUM',
            requiresSpecialCare: false,
            isActive: true,
        });
    };

    const filteredConditions = conditions.filter(condition =>
        condition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        condition.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-800';
            case 'HIGH': return 'bg-orange-100 text-orange-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Health Conditions Master</h1>
                <p className="text-gray-600">Manage health conditions and medical categories</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Total Conditions</div>
                    <div className="text-2xl font-bold">{conditions.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Active</div>
                    <div className="text-2xl font-bold text-green-600">
                        {conditions.filter(c => c.isActive).length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Critical Severity</div>
                    <div className="text-2xl font-bold text-red-600">
                        {conditions.filter(c => c.severity === 'CRITICAL').length}
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="text-sm text-gray-600">Special Care Required</div>
                    <div className="text-2xl font-bold text-orange-600">
                        {conditions.filter(c => c.requiresSpecialCare).length}
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex gap-4">
                <input
                    type="text"
                    placeholder="Search health conditions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    + Add Condition
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Special Care</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Citizens</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center">Loading...</td>
                            </tr>
                        ) : filteredConditions.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                    No health conditions found
                                </td>
                            </tr>
                        ) : (
                            filteredConditions.map((condition) => (
                                <tr key={condition.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium">{condition.code}</td>
                                    <td className="px-6 py-4 text-sm">{condition.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{condition.description}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(condition.severity)}`}>
                                            {condition.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        {condition.requiresSpecialCare ? (
                                            <span className="text-orange-600">Yes</span>
                                        ) : (
                                            <span className="text-gray-400">No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{condition.citizenCount || 0}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${condition.isActive
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                            }`}>
                                            {condition.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm space-x-2">
                                        <button
                                            onClick={() => handleEdit(condition)}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(condition.id)}
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
                            {editingCondition ? 'Edit Health Condition' : 'Add Health Condition'}
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
                                        placeholder="e.g., DIABETES"
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
                                        placeholder="e.g., Diabetes Mellitus"
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
                                        placeholder="Brief description of the condition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Severity*</label>
                                    <select
                                        value={formData.severity}
                                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.requiresSpecialCare}
                                            onChange={(e) => setFormData({ ...formData, requiresSpecialCare: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm font-medium">Requires Special Care</span>
                                    </label>
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
                                    {editingCondition ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
