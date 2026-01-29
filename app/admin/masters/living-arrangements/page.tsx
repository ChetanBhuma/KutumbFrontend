'use client';

import { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Plus, Edit2, Trash2, Search, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LivingArrangement {
    id: string;
    code: string;
    name: string;
    description: string;
    requiresCaretaker: boolean;
    riskLevel: string; // LOW, MEDIUM, HIGH
    isActive: boolean;
    citizenCount: number;
}

export default function LivingArrangementsPage() {

    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingArrangement, setEditingArrangement] = useState<LivingArrangement | null>(null);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        requiresCaretaker: false,
        riskLevel: 'LOW',
        isActive: true,
    });

    const fetchArrangements = useCallback(() => apiClient.get('/living-arrangements') as Promise<{ data: LivingArrangement[] }>, []);
    const { data: arrangementsData, loading, refetch } = useApiQuery<{ data: LivingArrangement[] }>(
        fetchArrangements,
        { refetchOnMount: true }
    );

    const arrangements = arrangementsData?.data || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError('');
            if (editingArrangement) {
                await apiClient.put(`/living-arrangements/${editingArrangement.id}`, formData);
            } else {
                await apiClient.post('/living-arrangements', formData);
            }
            setShowModal(false);
            resetForm();
            refetch();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (arrangement: LivingArrangement) => {
        setEditingArrangement(arrangement);
        setFormData({
            code: arrangement.code,
            name: arrangement.name,
            description: arrangement.description,
            requiresCaretaker: arrangement.requiresCaretaker,
            riskLevel: arrangement.riskLevel,
            isActive: arrangement.isActive,
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will affect citizens using this arrangement.')) return;
        try {
            await apiClient.delete(`/living-arrangements/${id}`);
            refetch();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Delete failed');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            description: '',
            requiresCaretaker: false,
            riskLevel: 'LOW',
            isActive: true,
        });
        setEditingArrangement(null);
        setError('');
    };

    const filteredArrangements = arrangements.filter(arrangement =>
        arrangement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        arrangement.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: arrangements.length,
        active: arrangements.filter(a => a.isActive).length,
        highRisk: arrangements.filter(a => a.riskLevel === 'HIGH').length,
        requiresCaretaker: arrangements.filter(a => a.requiresCaretaker).length,
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'HIGH': return 'bg-red-100 text-red-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

    return (
        <ProtectedRoute permissionCode="admin.masters">
            <div className="p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Living Arrangements Master</h1>
                    <p className="text-gray-600">Manage citizen living situation categories</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-sm text-gray-600">Total Arrangements</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                            <p className="text-sm text-gray-600">Active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
                            <p className="text-sm text-gray-600">High Risk</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-orange-600">{stats.requiresCaretaker}</div>
                            <p className="text-sm text-gray-600">Needs Caretaker</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Actions */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            placeholder="Search arrangements..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button onClick={() => { resetForm(); setShowModal(true); }}>
                        <Plus className="mr-2" size={20} /> Add Arrangement
                    </Button>
                </div>

                {/* Arrangements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredArrangements.map((arrangement) => (
                        <Card key={arrangement.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{arrangement.name}</CardTitle>
                                        <p className="text-sm text-gray-500">{arrangement.code}</p>
                                    </div>
                                    <Badge variant={arrangement.isActive ? 'default' : 'secondary'}>
                                        {arrangement.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-3">{arrangement.description}</p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Risk Level:</span>
                                        <Badge className={getRiskColor(arrangement.riskLevel)}>
                                            {arrangement.riskLevel}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Requires Caretaker:</span>
                                        <Badge variant={arrangement.requiresCaretaker ? 'destructive' : 'outline'}>
                                            {arrangement.requiresCaretaker ? 'Yes' : 'No'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Citizens:</span>
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {arrangement.citizenCount}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEdit(arrangement)}
                                    >
                                        <Edit2 size={16} className="mr-1" /> Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(arrangement.id)}
                                        disabled={arrangement.citizenCount > 0}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {filteredArrangements.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No living arrangements found
                    </div>
                )}

                {/* Add/Edit Modal */}
                <Dialog open={showModal} onOpenChange={setShowModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingArrangement ? 'Edit Living Arrangement' : 'Add Living Arrangement'}
                            </DialogTitle>
                        </DialogHeader>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="code">Code *</Label>
                                    <Input
                                        id="code"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="ALONE"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Living Alone"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Senior citizen living alone without family support"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="riskLevel">Risk Level *</Label>
                                    <select
                                        id="riskLevel"
                                        className="w-full rounded-md border border-gray-300 p-2"
                                        value={formData.riskLevel}
                                        onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                                <div className="flex items-center space-x-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="requiresCaretaker"
                                        checked={formData.requiresCaretaker}
                                        onChange={(e) => setFormData({ ...formData, requiresCaretaker: e.target.checked })}
                                        className="rounded"
                                    />
                                    <Label htmlFor="requiresCaretaker">Requires Caretaker</Label>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="rounded"
                                />
                                <Label htmlFor="isActive">Active</Label>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingArrangement ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}
