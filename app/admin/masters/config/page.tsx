'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';
import { useApiQuery } from '@/hooks/use-api-query';

interface ConfigItem {
    id: string;
    key: string;
    label: string;
    value: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'textarea';
    options?: string[];
    description: string;
    category: string;
    isActive: boolean;
}

export default function SystemConfigPage() {

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [localConfigs, setLocalConfigs] = useState<ConfigItem[]>([]);

    // Sample configuration items (replace with API call)
    const sampleConfigs: ConfigItem[] = [
        // Visit Management
        {
            id: '1',
            key: 'visit_default_duration',
            label: 'Default Visit Duration (minutes)',
            value: '30',
            type: 'number',
            description: 'Default duration for scheduled visits',
            category: 'Visit Management',
            isActive: true,
        },
        {
            id: '2',
            key: 'visit_reminder_hours',
            label: 'Visit Reminder (hours before)',
            value: '24',
            type: 'number',
            description: 'Send reminder notification before visit',
            category: 'Visit Management',
            isActive: true,
        },
        {
            id: '3',
            key: 'visit_types',
            label: 'Visit Types',
            value: 'Routine Check,Health Emergency,Welfare Check,Safety Inspection,Follow-up',
            type: 'textarea',
            description: 'Comma-separated list of visit types',
            category: 'Visit Management',
            isActive: true,
        },

        // SOS Management
        {
            id: '4',
            key: 'sos_auto_escalate_minutes',
            label: 'SOS Auto-escalate (minutes)',
            value: '15',
            type: 'number',
            description: 'Escalate SOS if not responded within',
            category: 'SOS Management',
            isActive: true,
        },
        {
            id: '5',
            key: 'sos_priority_levels',
            label: 'SOS Priority Levels',
            value: 'Critical,High,Medium,Low',
            type: 'textarea',
            description: 'Available SOS priority levels',
            category: 'SOS Management',
            isActive: true,
        },

        // Citizen Management
        {
            id: '6',
            key: 'vulnerability_levels',
            label: 'Vulnerability Levels',
            value: 'High,Medium,Low',
            type: 'textarea',
            description: 'Available vulnerability levels',
            category: 'Citizen Management',
            isActive: true,
        },
        {
            id: '7',
            key: 'living_arrangements',
            label: 'Living Arrangements',
            value: 'Alone,With Spouse,With Children,With Other Family,In Senior Care Home',
            type: 'textarea',
            description: 'Available living arrangement options',
            category: 'Citizen Management',
            isActive: true,
        },
        {
            id: '8',
            key: 'min_age_retirement',
            label: 'Minimum Retirement Age',
            value: '60',
            type: 'number',
            description: 'Minimum age to be registered as senior citizen',
            category: 'Citizen Management',
            isActive: true,
        },

        // Notifications
        {
            id: '9',
            key: 'sms_enabled',
            label: 'Enable SMS Notifications',
            value: 'true',
            type: 'boolean',
            description: 'Enable/disable SMS notifications',
            category: 'Notifications',
            isActive: true,
        },
        {
            id: '10',
            key: 'email_enabled',
            label: 'Enable Email Notifications',
            value: 'true',
            type: 'boolean',
            description: 'Enable/disable email notifications',
            category: 'Notifications',
            isActive: true,
        },
        {
            id: '11',
            key: 'push_enabled',
            label: 'Enable Push Notifications',
            value: 'true',
            type: 'boolean',
            description: 'Enable/disable push notifications',
            category: 'Notifications',
            isActive: true,
        },

        // Security
        {
            id: '12',
            key: 'session_timeout_minutes',
            label: 'Session Timeout (minutes)',
            value: '30',
            type: 'number',
            description: 'Automatic logout after inactivity',
            category: 'Security',
            isActive: true,
        },
        {
            id: '13',
            key: 'max_login_attempts',
            label: 'Maximum Login Attempts',
            value: '5',
            type: 'number',
            description: 'Lock account after failed attempts',
            category: 'Security',
            isActive: true,
        },
        {
            id: '14',
            key: 'password_min_length',
            label: 'Minimum Password Length',
            value: '8',
            type: 'number',
            description: 'Minimum characters for passwords',
            category: 'Security',
            isActive: true,
        },
        {
            id: '15',
            key: 'otp_expiry_minutes',
            label: 'OTP Expiry (minutes)',
            value: '10',
            type: 'number',
            description: 'OTP validity duration',
            category: 'Security',
            isActive: true,
        },
    ];

    const fetchConfigs = useCallback(() => {
        // Replace with actual API call
        // return apiClient.get('/system-config') as Promise<{ data: ConfigItem[] }>;
        return Promise.resolve({ data: sampleConfigs });
    }, []);

    const { data: configsData, loading, refetch } = useApiQuery<{ data: ConfigItem[] }>(
        fetchConfigs,
        { refetchOnMount: true }
    );

    useEffect(() => {
        if (configsData?.data) {
            setLocalConfigs(configsData.data);
        }
    }, [configsData]);

    const configs = localConfigs;

    const handleValueChange = (id: string, newValue: string) => {
        setLocalConfigs(configs.map(config =>
            config.id === id ? { ...config, value: newValue } : config
        ));
        setHasChanges(true);
    };

    const handleSave = async () => {
        try {
            await apiClient.updateSystemConfig(configs);
            alert('Configuration saved successfully!');
            setHasChanges(false);
        } catch (error) {
            console.error('Error saving configs:', error);
            alert('Error saving configuration');
        }
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all changes?')) {
            fetchConfigs();
            setHasChanges(false);
        }
    };

    const categories = ['all', ...new Set(configs.map(c => c.category))];

    const filteredConfigs = configs.filter(config => {
        const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
        const matchesSearch =
            config.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            config.description.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const renderInput = (config: ConfigItem) => {
        switch (config.type) {
            case 'boolean':
                return (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={config.value === 'true'}
                            onChange={(e) => handleValueChange(config.id, e.target.checked ? 'true' : 'false')}
                            className="w-5 h-5"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                            {config.value === 'true' ? 'Enabled' : 'Disabled'}
                        </span>
                    </div>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={config.value}
                        onChange={(e) => handleValueChange(config.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={config.value}
                        onChange={(e) => handleValueChange(config.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={3}
                    />
                );

            case 'select':
                return (
                    <select
                        value={config.value}
                        onChange={(e) => handleValueChange(config.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        {config.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                );

            default:
                return (
                    <input
                        type="text"
                        value={config.value}
                        onChange={(e) => handleValueChange(config.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                );
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">System Configuration</h1>
                <p className="text-gray-600">Configure system-wide settings and parameters</p>
            </div>

            {/* Actions Bar */}
            <div className="mb-6 flex justify-between items-center">
                <div className="flex gap-4 flex-1">
                    <input
                        type="text"
                        placeholder="Search configurations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 max-w-md px-4 py-2 border rounded-lg"
                    />

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-3">
                    {hasChanges && (
                        <>
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Reset Changes
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save All Changes
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Configuration Cards */}
            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <div className="space-y-6">
                    {categories.slice(1).map(category => {
                        const categoryConfigs = filteredConfigs.filter(c => c.category === category);
                        if (categoryConfigs.length === 0) return null;

                        return (
                            <div key={category} className="bg-white rounded-lg shadow">
                                <div className="px-6 py-4 border-b bg-gray-50">
                                    <h2 className="text-lg font-semibold">{category}</h2>
                                </div>
                                <div className="p-6 space-y-6">
                                    {categoryConfigs.map(config => (
                                        <div key={config.id} className="border-b pb-6 last:border-0 last:pb-0">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium mb-1">
                                                        {config.label}
                                                    </label>
                                                    <p className="text-sm text-gray-600">{config.description}</p>
                                                    <p className="text-xs text-gray-400 mt-1">Key: {config.key}</p>
                                                </div>
                                                <div>
                                                    {renderInput(config)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {filteredConfigs.length === 0 && !loading && (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <p className="text-gray-500">No configurations found</p>
                </div>
            )}
        </div>
    );
}
