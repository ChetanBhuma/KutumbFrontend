'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { useToast } from '@/components/ui/use-toast';

interface MaritalStatus {
    id: string;
    code: string;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;
}

export default function MaritalStatusMasterPage() {

    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState<MaritalStatus | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        isActive: true,
    });
    const { toast } = useToast();

    const fetchStatuses = useCallback(() => apiClient.get('/masters/marital-statuses') as Promise<{ data: MaritalStatus[] }>, []);
    const { data: statusesData, loading, refetch } = useApiQuery<{ data: MaritalStatus[] }>(
        fetchStatuses,
        { refetchOnMount: true }
    );

    const statuses = statusesData?.data || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStatus) {
                await apiClient.put(`/masters/marital-statuses/${editingStatus.id}`, formData);
                toast({ title: 'Success', description: 'Marital status updated successfully' });
            } else {
                await apiClient.post('/masters/marital-statuses', formData);
                toast({ title: 'Success', description: 'Marital status created successfully' });
            }
            setIsDialogOpen(false);
            refetch();
            resetForm();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save marital status',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this marital status?')) return;
        try {
            await apiClient.delete(`/masters/marital-statuses/${id}`);
            toast({ title: 'Success', description: 'Marital status deleted successfully' });
            refetch();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete marital status',
                variant: 'destructive',
            });
        }
    };

    const resetForm = () => {
        setFormData({ code: '', name: '', description: '', isActive: true });
        setEditingStatus(null);
    };

    const filteredStatuses = statuses.filter(status =>
        status.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        status.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-full">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Header title="Marital Status Master" description="Manage marital status options for citizen profiles" />
            </div>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Marital Status Master</h1>
                        <p className="text-muted-foreground">
                            Manage marital status options for citizen profiles
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                <Plus className="mr-2 h-4 w-4" /> Add Status
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingStatus ? 'Edit Status' : 'Add New Status'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Code</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                        disabled={!!editingStatus}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                </div>
                                <Button type="submit" className="w-full">
                                    {editingStatus ? 'Update' : 'Create'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search statuses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredStatuses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No marital statuses found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStatuses.map((status) => (
                                    <TableRow key={status.id}>
                                        <TableCell className="font-medium">{status.code}</TableCell>
                                        <TableCell>{status.name}</TableCell>
                                        <TableCell>{status.description}</TableCell>
                                        <TableCell>
                                            <Badge variant={status.isActive ? 'default' : 'secondary'}>
                                                {status.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingStatus(status);
                                                        setFormData({
                                                            code: status.code,
                                                            name: status.name,
                                                            description: status.description || '',
                                                            isActive: status.isActive,
                                                        });
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() => handleDelete(status.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
