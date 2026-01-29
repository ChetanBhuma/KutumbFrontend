'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';
import { ProtectedRoute } from '@/components/auth/protected-route';
import {
    Shield,
    User,
    Briefcase,
    Users,
    CheckSquare,
    Layout,
    Plus,
    Edit,
    Trash2,
    Save,
    X,
    Lock
} from 'lucide-react';

interface Role {
    id: string;
    name: string;
    code: string;
    description: string;
    permissions: string[];
    isActive: boolean;
    jurisdictionLevel: string;
    isMultiSelect: boolean;
    userCount: number;
    createdAt: string;
}

interface Permission {
    id: string;
    code: string;
    name: string;
    description?: string;
    categoryId?: string;
    parentId?: string;
    menuPath?: string;
    menuLabel?: string;
    menuIcon?: string;
    displayOrder: number;
    isActive: boolean;
    isMenuItem: boolean;
    category?: PermissionCategory;
    parent?: Permission;
    children?: Permission[];
}

interface PermissionCategory {
    id: string;
    code: string;
    name: string;
    description?: string;
    icon?: string;
    displayOrder: number;
    isActive: boolean;
    permissions?: Permission[];
}

export default function RolesMasterPage() {

    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loadingPermissions, setLoadingPermissions] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        permissions: [] as string[],
        isActive: true,
        jurisdictionLevel: 'NONE',
        isMultiSelect: false,
    });

    // Fetch permissions from API
    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                setLoadingPermissions(true);
                const response = await apiClient.getPermissionCategories();
                if (response.success) {
                    setPermissionCategories(response.data);
                    // Flatten all permissions for easy access
                    const allPerms: Permission[] = [];
                    response.data.forEach((cat: PermissionCategory) => {
                        if (cat.permissions) {
                            allPerms.push(...cat.permissions);
                        }
                    });
                    setAllPermissions(allPerms);
                }
            } catch (error) {
                console.error('Error fetching permissions:', error);
            } finally {
                setLoadingPermissions(false);
            }
        };
        fetchPermissions();
    }, []);

    const fetchRoles = useCallback(() => apiClient.get('/roles') as Promise<{ data: Role[] }>, []);
    const { data: rolesData, loading, refetch } = useApiQuery<Role[]>(
        fetchRoles,
        { refetchOnMount: true }
    );

    const roles = rolesData || [];

    // Set initial selected role
    useEffect(() => {
        if (roles.length > 0 && !selectedRole) {
            setSelectedRole(roles[0]);
        } else if (selectedRole) {
            // Update selected role data if it changes in the background (e.g. after save)
            const updated = roles.find(r => r.id === selectedRole.id);
            if (updated) setSelectedRole(updated);
        }
    }, [roles, selectedRole]);

    const getRoleIcon = (code: string) => {
        const c = code.toUpperCase();
        if (c.includes('ADM')) return <Shield className="w-6 h-6" />;
        if (c.includes('CITIZEN')) return <User className="w-6 h-6" />;
        if (c.includes('OFFICER') || c.includes('INS')) return <Briefcase className="w-6 h-6" />;
        if (c.includes('AR') || c.includes('APPL')) return <Briefcase className="w-6 h-6" />;
        return <Users className="w-6 h-6" />;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingRole) {
                await apiClient.patch(`/roles/${editingRole.id}`, formData);
            } else {
                await apiClient.post('/roles', formData);
            }

            refetch();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving role:', error);
            const message = error.response?.data?.message || 'Error saving role';
            alert(message);
        }
    };



    // Original Edit Handler (for Modal - used for Creating/Full Editing)
    const handleEditFull = (role: Role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            code: role.code,
            description: role.description,
            permissions: role.permissions,
            isActive: role.isActive,
            jurisdictionLevel: role.jurisdictionLevel || 'NONE',
            isMultiSelect: role.isMultiSelect || false,
        });
        setShowModal(true);
    };



    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;

        try {
            await apiClient.delete(`/roles/${id}`);
            refetch();
            if (selectedRole?.id === id) {
                setSelectedRole(null);
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            alert('Error deleting role');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRole(null);
        setFormData({
            name: '',
            code: '',
            description: '',
            permissions: [],
            isActive: true,
            jurisdictionLevel: 'NONE',
            isMultiSelect: false,
        });
    };

    const togglePermission = (permission: string) => {
        setFormData({
            ...formData,
            permissions: formData.permissions.includes(permission)
                ? formData.permissions.filter(p => p !== permission)
                : [...formData.permissions, permission],
        });
    };

    const selectAllPermissions = () => {
        const allPermCodes = allPermissions.map(p => p.code);
        setFormData({ ...formData, permissions: allPermCodes });
    };

    const clearAllPermissions = () => {
        setFormData({ ...formData, permissions: [] });
    };

    return (
        <ProtectedRoute permissionCode="admin.roles">
            <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
                        {/* <p className="text-gray-500 text-sm">Manage access control and permissions</p> */}
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Role
                    </button>
                </div>

                <div className="bg-white rounded-lg border shadow-sm flex flex-1 overflow-hidden">
                    {/* Left Sidebar - Roles List */}
                    <div className="w-1/3 border-r bg-gray-50 flex flex-col">
                        <div className="p-4 border-b bg-white">
                            <div className="flex items-center gap-2 text-blue-900 font-semibold">
                                <Shield className="w-5 h-5" />
                                <span>System Roles</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loading ? (
                                <div className="text-center py-4 text-gray-500">Loading roles...</div>
                            ) : roles.map((role) => (
                                <div
                                    key={role.id}
                                    onClick={() => {
                                        setSelectedRole(role);
                                    }}
                                    className={`p-4 rounded-lg cursor-pointer border transition-all duration-200 flex items-start gap-3 ${selectedRole?.id === role.id
                                        ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200 shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
                                        }`}
                                >
                                    <div className={`mt-1 p-2 rounded-lg ${selectedRole?.id === role.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {getRoleIcon(role.code)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className={`font-semibold text-sm ${selectedRole?.id === role.id ? 'text-blue-900' : 'text-gray-900'
                                                }`}>
                                                {role.code}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{role.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Details & Permissions */}
                    <div className="w-2/3 flex flex-col bg-white">
                        {selectedRole ? (
                            <>
                                <div className="p-6 border-b">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                                                {getRoleIcon(selectedRole.code)}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                                    Permissions for: {selectedRole.code}
                                                    {!selectedRole.isActive && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">Inactive</span>
                                                    )}
                                                </h2>
                                                <p className="text-gray-500 mt-1">{selectedRole.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditFull(selectedRole)}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit Role
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    {loadingPermissions ? (
                                        <div className="text-center py-8 text-gray-500">Loading permissions...</div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-8">
                                            {permissionCategories.map((category) => (
                                                <div key={category.id} className="space-y-3">
                                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b flex items-center gap-2">
                                                        {category.icon && <span>{category.icon}</span>}
                                                        {category.name}
                                                        <span className="text-xs text-gray-500 font-normal ml-auto">
                                                            {category.permissions?.length || 0} permissions
                                                        </span>
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {category.permissions?.map((permission: Permission) => {
                                                            const isChecked = selectedRole.permissions.includes(permission.code);

                                                            return (
                                                                <div
                                                                    key={permission.id}
                                                                    className="flex items-start gap-3 p-2 rounded-md transition-colors hover:bg-gray-50"
                                                                >
                                                                    <div className={`
                                                                        w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5
                                                                        ${isChecked
                                                                            ? 'bg-blue-500 border-blue-500 text-white'
                                                                            : 'border-gray-300 bg-white text-transparent'
                                                                        }
                                                                    `}>
                                                                        {isChecked && <CheckSquare className="w-3.5 h-3.5 fill-current" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className={`text-sm ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                                            {permission.name}
                                                                        </div>
                                                                        <code className="text-xs text-gray-400 block truncate">
                                                                            {permission.code}
                                                                        </code>
                                                                        {permission.menuPath && (
                                                                            <div className="text-xs text-blue-600 mt-1">
                                                                                📍 {permission.menuPath}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                                <Layout className="w-16 h-16 mb-4 opacity-20" />
                                <p>Select a role to view permissions</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create/Edit Modal (Kept for creating new roles mainly) */}
                {showModal && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
                        onClick={handleCloseModal}
                    >
                        <div
                            className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingRole ? 'Edit Role Details' : 'Create New Role'}
                                </h2>
                                <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role Code *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. ROLE_MANAGER"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. Manager"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                                        <textarea
                                            required
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            rows={3}
                                            placeholder="Brief description of the role's responsibilities"
                                        />
                                    </div>

                                    <div className="col-span-2 grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Jurisdiction Level</label>
                                            <select
                                                value={formData.jurisdictionLevel}
                                                onChange={(e) => setFormData({ ...formData, jurisdictionLevel: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            >
                                                <option value="NONE">None (Global/Admin)</option>
                                                <option value="RANGE">Range Level</option>
                                                <option value="DISTRICT">District Level</option>
                                                <option value="SUB_DIVISION">Sub-Division Level</option>
                                                <option value="POLICE_STATION">Police Station Level</option>
                                                <option value="BEAT">Beat Level</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">Defines the administrative level this role manages.</p>
                                        </div>

                                        <div className="flex items-center h-full pt-6">
                                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer w-full">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.isMultiSelect}
                                                    onChange={(e) => setFormData({ ...formData, isMultiSelect: e.target.checked })}
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <div>
                                                    <span className="font-medium text-gray-900">Allow Multiple?</span>
                                                    <p className="text-xs text-gray-500">Can this role manage multiple units?</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isActive}
                                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <div>
                                                <span className="font-medium text-gray-900">Active Status</span>
                                                <p className="text-xs text-gray-500">Inactive roles cannot be assigned to users</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-sm font-semibold text-gray-700">Permissions</label>
                                        <div className="space-x-4">
                                            <button type="button" onClick={() => selectAllPermissions()} className="text-xs font-medium text-blue-600 hover:text-blue-800">Select All</button>
                                            <button type="button" onClick={() => clearAllPermissions()} className="text-xs font-medium text-gray-500 hover:text-gray-700">Clear All</button>
                                        </div>
                                    </div>
                                    <div className="h-64 overflow-y-auto border rounded-xl p-4 bg-gray-50 space-y-6">
                                        {loadingPermissions ? (
                                            <div className="text-center py-8 text-gray-500">Loading permissions...</div>
                                        ) : (
                                            permissionCategories.map((category) => (
                                                <div key={category.id}>
                                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-1 border-b border-gray-200">
                                                        {category.name}
                                                    </h4>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {category.permissions?.map((permission: Permission) => (
                                                            <label key={permission.id} className="flex items-center gap-2 text-sm group cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.permissions.includes(permission.code)}
                                                                    onChange={() => togglePermission(permission.code)}
                                                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors"
                                                                />
                                                                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                                                    {permission.name}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>


                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        {editingRole ? 'Update Role' : 'Create Role'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
                }
            </div >

        </ProtectedRoute >
    );
}
