'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface MasterModule {
    title: string;
    description: string;
    icon: string;
    href: string;
    countKey: string;
    color: string;
    suffix: string;
}

const masterModules: MasterModule[] = [
    {
        title: 'Ranges',
        description: 'Manage police ranges (highest jurisdiction level)',
        icon: '🌐',
        href: '/admin/masters/ranges',
        countKey: 'ranges',
        color: 'bg-cyan-50 text-cyan-600',
        suffix: 'Ranges',
    },
    {
        title: 'Districts',
        description: 'Manage administrative districts',
        icon: '🗺️',
        href: '/admin/masters/districts',
        countKey: 'districts',
        color: 'bg-indigo-50 text-indigo-600',
        suffix: 'Districts',
    },
    {
        title: 'Sub-Divisions',
        description: 'Manage administrative sub-divisions',
        icon: '🏘️',
        href: '/admin/masters/sub-divisions',
        countKey: 'subDivisions',
        color: 'bg-teal-50 text-teal-600',
        suffix: 'Sub-Divisions',
    },
    {
        title: 'Police Stations',
        description: 'Manage police stations, contact details, and jurisdictions',
        icon: '🏢',
        href: '/admin/masters/police-stations',
        countKey: 'policeStations',
        color: 'bg-blue-50 text-blue-600',
        suffix: 'Stations',
    },
    {
        title: 'Beats',
        description: 'Manage beats and officer assignments',
        icon: '📍',
        href: '/admin/masters/beats',
        countKey: 'beats',
        color: 'bg-green-50 text-green-600',
        suffix: 'Beats',
    },
    {
        title: 'User Roles',
        description: 'Manage user roles and permissions',
        icon: '👥',
        href: '/admin/masters/roles',
        countKey: 'roles',
        color: 'bg-purple-50 text-purple-600',
        suffix: 'Roles',
    },
    {
        title: 'Permissions',
        description: 'Manage system permissions and access control',
        icon: '🔑',
        href: '/admin/masters/permissions',
        countKey: 'permissions',
        color: 'bg-amber-50 text-amber-600',
        suffix: 'Permissions',
    },
    {
        title: 'System Configuration',
        description: 'Configure system-wide settings and parameters',
        icon: '⚙️',
        href: '/admin/masters/config',
        countKey: 'systemConfig',
        color: 'bg-orange-50 text-orange-600',
        suffix: 'Settings',
    },
    {
        title: 'Visit Types',
        description: 'Manage visit categories and purposes',
        icon: '📋',
        href: '/admin/masters/visit-types',
        countKey: 'visitTypes',
        color: 'bg-pink-50 text-pink-600',
        suffix: 'Types',
    },
    {
        title: 'Health Conditions',
        description: 'Manage health condition categories',
        icon: '🏥',
        href: '/admin/masters/health-conditions',
        countKey: 'healthConditions',
        color: 'bg-red-50 text-red-600',
        suffix: 'Conditions',
    },
    {
        title: 'Designations',
        description: 'Manage police ranks and designations',
        icon: '🎖️',
        href: '/admin/masters/designations',
        countKey: 'designations',
        color: 'bg-yellow-50 text-yellow-600',
        suffix: 'Ranks',
    },
    {
        title: 'Living Arrangements',
        description: 'Manage senior citizen living situation categories',
        icon: '🏠',
        href: '/admin/masters/living-arrangements',
        countKey: 'livingArrangements',
        color: 'bg-teal-50 text-teal-600',
        suffix: 'Types',
    },
    {
        title: 'Marital Status',
        description: 'Manage marital status options for citizens',
        icon: '💑',
        href: '/admin/masters/marital-status',
        countKey: 'maritalStatuses',
        color: 'bg-rose-50 text-rose-600',
        suffix: 'Types',
    },
];

export default function MasterDashboardPage() {
    const [counts, setCounts] = useState<Record<string, number | null>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                // Fetch public masters first (often faster)
                const endpoints = [
                    { key: 'ranges', url: '/ranges' },
                    { key: 'districts', url: '/districts' },
                    { key: 'subDivisions', url: '/sub-divisions' },
                    { key: 'policeStations', url: '/police-stations' }, // Protected
                    { key: 'beats', url: '/beats' }, // Protected
                    { key: 'roles', url: '/roles' }, // Protected
                    { key: 'permissions', url: '/permissions/all' }, // Protected - NEW
                    { key: 'visitTypes', url: '/visit-types' },
                    { key: 'healthConditions', url: '/health-conditions' },
                    { key: 'designations', url: '/designations' },
                    { key: 'livingArrangements', url: '/living-arrangements' },
                    { key: 'maritalStatuses', url: '/marital-statuses' },
                ];

                const results = await Promise.allSettled(
                    endpoints.map(async ({ key, url }) => {
                        const response = await apiClient.get<any>(url);
                        // Handle standard array response { success: true, data: [] } or just [] (if unwrapped by unknown interceptor, but we assume data inside)
                        const list = response.success && Array.isArray(response.data) ? response.data :
                            Array.isArray(response) ? response : [];
                        return { key, count: list.length };
                    })
                );

                // Fetch System Config separately (object)
                let configCount = 0;
                try {
                    const configRes = await apiClient.get<any>('/system-config');
                    if (configRes.success && configRes.data) {
                        configCount = Object.keys(configRes.data).length;
                    }
                } catch (e) {
                    console.warn('Failed to fetch system config', e);
                }

                const newCounts: Record<string, number> = { systemConfig: configCount };

                results.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        newCounts[result.value.key] = result.value.count;
                    } else {
                        // console.error(`Failed to fetch ${result.reason}`);
                    }
                });

                setCounts(newCounts);
            } catch (error) {
                console.error('Error fetching dashboard counts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, []);

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Master Data Management</h1>
                <p className="text-gray-600">
                    Configure and manage all master data for the Senior Citizen Portal
                </p>
            </div>

            {/* Quick Stats - Dynamic */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-gray-600 text-sm mb-1">Total Police Stations</div>
                    <div className="text-3xl font-bold">
                        {counts.policeStations !== undefined ? counts.policeStations : '...'}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-gray-600 text-sm mb-1">Total Beats</div>
                    <div className="text-3xl font-bold">
                        {counts.beats !== undefined ? counts.beats : '...'}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-gray-600 text-sm mb-1">Active Roles</div>
                    {/* Using roles count here instead of users for now as users API might be heavier */}
                    <div className="text-3xl font-bold">
                        {counts.roles !== undefined ? counts.roles : '...'}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-gray-600 text-sm mb-1">Configuration Items</div>
                    <div className="text-3xl font-bold">
                        {counts.systemConfig !== undefined ? counts.systemConfig : '...'}
                    </div>
                </div>
            </div>

            {/* Master Modules Grid */}
            <div className="grid grid-cols-3 gap-6">
                {masterModules.map((module) => (
                    <Link
                        key={module.href}
                        href={module.href}
                        className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`text-4xl w-16 h-16 rounded-lg ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                {module.icon}
                            </div>
                            <span className="text-sm text-gray-500">
                                {counts[module.countKey] !== undefined
                                    ? `${counts[module.countKey]} ${module.suffix}`
                                    : 'Loading...'}
                            </span>
                        </div>

                        <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">
                            {module.title}
                        </h3>

                        <p className="text-sm text-gray-600">
                            {module.description}
                        </p>

                        <div className="mt-4 text-sm text-blue-600 font-medium flex items-center group-hover:translate-x-2 transition-transform">
                            Manage →
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recent Activity - Static for now as no API exists yet */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    <p className="text-gray-500 text-sm italic">Activity log integration coming soon.</p>
                </div>
            </div>
        </div>
    );
}
