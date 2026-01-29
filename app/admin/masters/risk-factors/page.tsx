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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { useToast } from '@/components/ui/use-toast';

interface RiskFactor {
    id: string;
    code: string;
    name: string;
    description: string;
    weight: number;
    category: string;
    isActive: boolean;
    createdAt: string;
}

export default function RiskFactorMasterPage() {

    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingFactor, setEditingFactor] = useState<RiskFactor | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        weight: 1,
        category: 'HEALTH',
        isActive: true,
    });
    const { toast } = useToast();

    const fetchFactors = useCallback(() => apiClient.get('/masters/risk-factors') as Promise<{ data: RiskFactor[] }>, []);
    const { data: factorsData, loading, refetch } = useApiQuery<{ data: RiskFactor[] }>(
        fetchFactors,
        { refetchOnMount: true }
    );

    const factors = factorsData?.data || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingFactor) {
                await apiClient.put(`/masters/risk-factors/${editingFactor.id}`, formData);
                toast({ title: 'Success', description: 'Risk factor updated successfully' });
            } else {
                await apiClient.post('/masters/risk-factors', formData);
                toast({ title: 'Success', description: 'Risk factor created successfully' });
            }
            setIsDialogOpen(false);
            refetch();
            resetForm();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save risk factor',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this risk factor?')) return;
        try {
            await apiClient.delete(`/masters/risk-factors/${id}`);
            toast({ title: 'Success', description: 'Risk factor deleted successfully' });
            refetch();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete risk factor',
                variant: 'destructive',
            });
        }
    };

    const resetForm = () => {
        setFormData({ code: '', name: '', description: '', weight: 1, category: 'HEALTH', isActive: true });
        setEditingFactor(null);
    };

    const filteredFactors = factors.filter(factor =>
        factor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        factor.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-full">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <Header title="Risk Factor Master" description="Manage risk factors and weights for vulnerability assessment" />
            </div>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Risk Factor Master</h1>
                        <p className="text-muted-foreground">
                            Manage risk factors and weights for vulnerability assessment
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={resetForm}>
                                <Plus className="mr-2 h-4 w-4" /> Add Factor
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingFactor ? 'Edit Factor' : 'Add New Factor'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Code</Label>
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            disabled={!!editingFactor}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HEALTH">Health</SelectItem>
                                                <SelectItem value="SOCIAL">Social</SelectItem>
                                                <SelectItem value="ECONOMIC">Economic</SelectItem>
                                                <SelectItem value="LIVING">Living Situation</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
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
                                <div className="space-y-2">
                                    <Label htmlFor="weight">Risk Weight (1-10)</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) || 1 })}
                                        required
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
                                    {editingFactor ? 'Update' : 'Create'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search factors..."
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
                                <TableHead>Category</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Weight</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredFactors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No risk factors found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredFactors.map((factor) => (
                                    <TableRow key={factor.id}>
                                        <TableCell className="font-medium">{factor.code}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{factor.category}</Badge>
                                        </TableCell>
                                        <TableCell>{factor.name}</TableCell>
                                        <TableCell>
                                            <Badge className={
                                                factor.weight >= 8 ? 'bg-red-500' :
                                                    factor.weight >= 5 ? 'bg-yellow-500' :
                                                        'bg-green-500'
                                            }>
                                                {factor.weight}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={factor.isActive ? 'default' : 'secondary'}>
                                                {factor.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setEditingFactor(factor);
                                                        setFormData({
                                                            code: factor.code,
                                                            name: factor.name,
                                                            description: factor.description || '',
                                                            weight: factor.weight,
                                                            category: factor.category,
                                                            isActive: factor.isActive,
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
                                                    onClick={() => handleDelete(factor.id)}
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
