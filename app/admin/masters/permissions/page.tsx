"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, FolderTree, Menu, Shield, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import apiClient from "@/lib/api-client"
import { ProtectedRoute } from "@/components/auth/protected-route"

interface Permission {
    id: string
    code: string
    name: string
    description?: string
    categoryId?: string
    parentId?: string
    menuPath?: string
    menuLabel?: string
    menuIcon?: string
    displayOrder: number
    isActive: boolean
    isMenuItem: boolean
    category?: PermissionCategory
    parent?: Permission
    children?: Permission[]
}

interface PermissionCategory {
    id: string
    code: string
    name: string
    description?: string
    icon?: string
    displayOrder: number
    isActive: boolean
    permissions?: Permission[]
    _count?: { permissions: number }
}

export default function PermissionMasterPage() {
    return (
        <ProtectedRoute permissionCode="admin.permissions">
            <PermissionMasterContent />
        </ProtectedRoute>
    )
}

function PermissionMasterContent() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [categories, setCategories] = useState<PermissionCategory[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [showPermissionDialog, setShowPermissionDialog] = useState(false)
    const [showCategoryDialog, setShowCategoryDialog] = useState(false)
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
    const [editingCategory, setEditingCategory] = useState<PermissionCategory | null>(null)

    // Permission form state
    const [permissionForm, setPermissionForm] = useState({
        code: "",
        name: "",
        description: "",
        categoryId: "",
        parentId: "",
        menuPath: "",
        menuLabel: "",
        menuIcon: "",
        displayOrder: 0,
        isActive: true,
        isMenuItem: false,
    })

    // Category form state
    const [categoryForm, setCategoryForm] = useState({
        code: "",
        name: "",
        description: "",
        icon: "",
        displayOrder: 0,
        isActive: true,
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [permsResponse, catsResponse] = await Promise.all([
                apiClient.getAllPermissions(),
                apiClient.getAllCategories(),
            ])

            if (permsResponse.success) {
                setPermissions(permsResponse.data)
            }
            if (catsResponse.success) {
                setCategories(catsResponse.data)
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load permissions",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePermission = () => {
        setEditingPermission(null)
        setPermissionForm({
            code: "",
            name: "",
            description: "",
            categoryId: "",
            parentId: "",
            menuPath: "",
            menuLabel: "",
            menuIcon: "",
            displayOrder: 0,
            isActive: true,
            isMenuItem: false,
        })
        setShowPermissionDialog(true)
    }

    const handleEditPermission = (permission: Permission) => {
        setEditingPermission(permission)
        setPermissionForm({
            code: permission.code,
            name: permission.name,
            description: permission.description || "",
            categoryId: permission.categoryId || "",
            parentId: permission.parentId || "",
            menuPath: permission.menuPath || "",
            menuLabel: permission.menuLabel || "",
            menuIcon: permission.menuIcon || "",
            displayOrder: permission.displayOrder,
            isActive: permission.isActive,
            isMenuItem: permission.isMenuItem,
        })
        setShowPermissionDialog(true)
    }

    const handleSavePermission = async () => {
        try {
            if (editingPermission) {
                await apiClient.updatePermission(editingPermission.id, permissionForm)
                toast({ title: "Success", description: "Permission updated successfully" })
            } else {
                await apiClient.createPermission(permissionForm)
                toast({ title: "Success", description: "Permission created successfully" })
            }
            setShowPermissionDialog(false)
            fetchData()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save permission",
                variant: "destructive",
            })
        }
    }

    const handleDeletePermission = async (id: string) => {
        if (!confirm("Are you sure you want to delete this permission?")) return

        try {
            await apiClient.deletePermission(id)
            toast({ title: "Success", description: "Permission deleted successfully" })
            fetchData()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete permission",
                variant: "destructive",
            })
        }
    }

    const handleCreateCategory = () => {
        setEditingCategory(null)
        setCategoryForm({
            code: "",
            name: "",
            description: "",
            icon: "",
            displayOrder: 0,
            isActive: true,
        })
        setShowCategoryDialog(true)
    }

    const handleEditCategory = (category: PermissionCategory) => {
        setEditingCategory(category)
        setCategoryForm({
            code: category.code,
            name: category.name,
            description: category.description || "",
            icon: category.icon || "",
            displayOrder: category.displayOrder,
            isActive: category.isActive,
        })
        setShowCategoryDialog(true)
    }

    const handleSaveCategory = async () => {
        try {
            if (editingCategory) {
                await apiClient.updateCategory(editingCategory.id, categoryForm)
                toast({ title: "Success", description: "Category updated successfully" })
            } else {
                await apiClient.createCategory(categoryForm)
                toast({ title: "Success", description: "Category created successfully" })
            }
            setShowCategoryDialog(false)
            fetchData()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save category",
                variant: "destructive",
            })
        }
    }

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return

        try {
            await apiClient.deleteCategory(id)
            toast({ title: "Success", description: "Category deleted successfully" })
            fetchData()
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete category",
                variant: "destructive",
            })
        }
    }

    const filteredPermissions = permissions.filter((perm) => {
        const matchesSearch =
            perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            perm.code.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "all" || perm.categoryId === selectedCategory
        return matchesSearch && matchesCategory
    })

    const stats = {
        totalPermissions: permissions.length,
        totalCategories: categories.length,
        menuItems: permissions.filter((p) => p.isMenuItem).length,
        activePermissions: permissions.filter((p) => p.isActive).length,
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Permission Master</h1>
                    <p className="text-muted-foreground">Manage permissions and categories</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Permissions</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPermissions}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Categories</CardTitle>
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalCategories}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                        <Menu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.menuItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Shield className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activePermissions}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="permissions" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="categories">Categories</TabsTrigger>
                </TabsList>

                {/* Permissions Tab */}
                <TabsContent value="permissions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Permissions</CardTitle>
                                    <CardDescription>Manage system permissions</CardDescription>
                                </div>
                                <Button onClick={handleCreatePermission}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Permission
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Filters */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Input
                                        placeholder="Search permissions..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="max-w-sm"
                                    />
                                </div>
                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Filter by category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Permissions List */}
                            <div className="border rounded-lg">
                                <table className="w-full">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-3">Code</th>
                                            <th className="text-left p-3">Name</th>
                                            <th className="text-left p-3">Category</th>
                                            <th className="text-left p-3">Menu</th>
                                            <th className="text-left p-3">Status</th>
                                            <th className="text-right p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPermissions.map((permission) => (
                                            <tr key={permission.id} className="border-t hover:bg-muted/50">
                                                <td className="p-3">
                                                    <code className="text-sm bg-muted px-2 py-1 rounded">{permission.code}</code>
                                                </td>
                                                <td className="p-3">{permission.name}</td>
                                                <td className="p-3">
                                                    {permission.category ? (
                                                        <Badge variant="outline">{permission.category.name}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {permission.isMenuItem ? (
                                                        <Badge className="bg-blue-500">{permission.menuLabel || "Menu Item"}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={permission.isActive ? "default" : "secondary"}>
                                                        {permission.isActive ? "Active" : "Inactive"}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-right space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditPermission(permission)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletePermission(permission.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Categories Tab */}
                <TabsContent value="categories" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Categories</CardTitle>
                                    <CardDescription>Manage permission categories</CardDescription>
                                </div>
                                <Button onClick={handleCreateCategory}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Category
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {categories.map((category) => (
                                    <Card key={category.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-lg">{category.name}</CardTitle>
                                                    <code className="text-xs text-muted-foreground">{category.code}</code>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditCategory(category)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteCategory(category.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                                            <div className="flex justify-between items-center">
                                                <Badge variant="outline">
                                                    {category._count?.permissions || 0} permissions
                                                </Badge>
                                                <Badge variant={category.isActive ? "default" : "secondary"}>
                                                    {category.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Permission Dialog */}
            <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPermission ? "Edit Permission" : "Create Permission"}</DialogTitle>
                        <DialogDescription>
                            {editingPermission ? "Update permission details" : "Add a new permission to the system"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Code *</Label>
                                <Input
                                    id="code"
                                    value={permissionForm.code}
                                    onChange={(e) => setPermissionForm({ ...permissionForm, code: e.target.value })}
                                    placeholder="e.g., citizens.read"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={permissionForm.name}
                                    onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                                    placeholder="e.g., View Citizens"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={permissionForm.description}
                                onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                                placeholder="Optional description"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={permissionForm.categoryId || "none"}
                                    onValueChange={(value) => setPermissionForm({ ...permissionForm, categoryId: value === "none" ? "" : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parent">Parent Permission</Label>
                                <Select
                                    value={permissionForm.parentId || "none"}
                                    onValueChange={(value) => setPermissionForm({ ...permissionForm, parentId: value === "none" ? "" : value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {permissions
                                            .filter((p) => p.id !== editingPermission?.id)
                                            .map((perm) => (
                                                <SelectItem key={perm.id} value={perm.id}>
                                                    {perm.name}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isMenuItem"
                                    checked={permissionForm.isMenuItem}
                                    onCheckedChange={(checked) =>
                                        setPermissionForm({ ...permissionForm, isMenuItem: checked as boolean })
                                    }
                                />
                                <Label htmlFor="isMenuItem">This is a menu item</Label>
                            </div>
                        </div>

                        {permissionForm.isMenuItem && (
                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                                <div className="space-y-2">
                                    <Label htmlFor="menuPath">Menu Path</Label>
                                    <Input
                                        id="menuPath"
                                        value={permissionForm.menuPath}
                                        onChange={(e) => setPermissionForm({ ...permissionForm, menuPath: e.target.value })}
                                        placeholder="/citizens"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="menuLabel">Menu Label</Label>
                                    <Input
                                        id="menuLabel"
                                        value={permissionForm.menuLabel}
                                        onChange={(e) => setPermissionForm({ ...permissionForm, menuLabel: e.target.value })}
                                        placeholder="Citizens"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="menuIcon">Menu Icon</Label>
                                    <Input
                                        id="menuIcon"
                                        value={permissionForm.menuIcon}
                                        onChange={(e) => setPermissionForm({ ...permissionForm, menuIcon: e.target.value })}
                                        placeholder="Users"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="displayOrder">Display Order</Label>
                                    <Input
                                        id="displayOrder"
                                        type="number"
                                        value={permissionForm.displayOrder}
                                        onChange={(e) =>
                                            setPermissionForm({ ...permissionForm, displayOrder: parseInt(e.target.value) || 0 })
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isActive"
                                checked={permissionForm.isActive}
                                onCheckedChange={(checked) =>
                                    setPermissionForm({ ...permissionForm, isActive: checked as boolean })
                                }
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSavePermission}>
                            {editingPermission ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Category Dialog */}
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "Update category details" : "Add a new permission category"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cat-code">Code *</Label>
                                <Input
                                    id="cat-code"
                                    value={categoryForm.code}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                                    placeholder="e.g., citizens"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cat-name">Name *</Label>
                                <Input
                                    id="cat-name"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    placeholder="e.g., Citizens"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cat-description">Description</Label>
                            <Input
                                id="cat-description"
                                value={categoryForm.description}
                                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                placeholder="Optional description"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cat-icon">Icon</Label>
                                <Input
                                    id="cat-icon"
                                    value={categoryForm.icon}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                                    placeholder="Users"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cat-order">Display Order</Label>
                                <Input
                                    id="cat-order"
                                    type="number"
                                    value={categoryForm.displayOrder}
                                    onChange={(e) =>
                                        setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) || 0 })
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="cat-active"
                                checked={categoryForm.isActive}
                                onCheckedChange={(checked) =>
                                    setCategoryForm({ ...categoryForm, isActive: checked as boolean })
                                }
                            />
                            <Label htmlFor="cat-active">Active</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveCategory}>
                            {editingCategory ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
