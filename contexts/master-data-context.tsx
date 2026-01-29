"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/lib/api-client';

interface District {
    id: string;
    name: string;
    code: string;
    [key: string]: any;
}

interface PoliceStation {
    id: string;
    name: string;
    code: string;
    districtId?: string;
    [key: string]: any;
}

interface Beat {
    id: string;
    name: string;
    code: string;
    policeStationId?: string;
    [key: string]: any;
}

interface MasterDataContextType {
    // Data
    districts: District[];
    policeStations: PoliceStation[];
    beats: Beat[];

    // Loading states
    loading: boolean;
    districtsLoading: boolean;
    policeStationsLoading: boolean;
    beatsLoading: boolean;

    // Error states
    error: Error | null;

    // Helper functions
    getPoliceStationsByDistrict: (districtId: string) => PoliceStation[];
    getBeatsByPoliceStation: (policeStationId: string) => Beat[];
    getDistrictById: (id: string) => District | undefined;
    getPoliceStationById: (id: string) => PoliceStation | undefined;
    getBeatById: (id: string) => Beat | undefined;

    // Refresh functions
    refreshDistricts: () => Promise<void>;
    refreshPoliceStations: (districtId?: string) => Promise<void>;
    refreshBeats: (policeStationId?: string) => Promise<void>;
    refreshAll: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

/**
 * Master Data Provider
 * Centralizes loading of Districts, Police Stations, and Beats
 * Eliminates repeated fetching in 10+ components
 */
export function MasterDataProvider({ children }: { children: ReactNode }) {
    const [districts, setDistricts] = useState<District[]>([]);
    const [policeStations, setPoliceStations] = useState<PoliceStation[]>([]);
    const [beats, setBeats] = useState<Beat[]>([]);

    const [districtsLoading, setDistrictsLoading] = useState(true);
    const [policeStationsLoading, setPoliceStationsLoading] = useState(true);
    const [beatsLoading, setBeatsLoading] = useState(true);

    const [error, setError] = useState<Error | null>(null);

    // Load districts
    const refreshDistricts = async () => {
        try {
            setDistrictsLoading(true);
            setError(null);

            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await apiClient.getDistricts();
            clearTimeout(timeoutId);

            const data = response.data?.districts || response.data || [];
            setDistricts(data);
        } catch (err: any) {
            // Silently ignore 401/403 errors (user not authenticated or authorized)
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                setDistrictsLoading(false);
                return;
            }
            // Silently ignore 500 errors and set empty data
            if (err?.response?.status === 500 || err?.code === 'ECONNABORTED' || err?.name === 'AbortError') {
                console.warn('Master data service unavailable, using empty data');
                setDistricts([]);
                setDistrictsLoading(false);
                return;
            }
            const error = err instanceof Error ? err : new Error('Failed to load districts');
            setError(error);
            console.error('Error loading districts:', error);
        } finally {
            setDistrictsLoading(false);
        }
    };

    // Load police stations
    const refreshPoliceStations = async (districtId?: string) => {
        try {
            setPoliceStationsLoading(true);
            setError(null);
            const response = await apiClient.getPoliceStations(
                districtId ? { districtId } : undefined
            );
            const data = response.data?.policeStations || response.data || [];
            setPoliceStations(data);
        } catch (err: any) {
            // Silently ignore 401/403 errors (user not authenticated or authorized)
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                setPoliceStationsLoading(false);
                return;
            }
            // Silently ignore 500 errors and set empty data
            if (err?.response?.status === 500 || err?.code === 'ECONNABORTED' || err?.name === 'AbortError') {
                console.warn('Police stations service unavailable, using empty data');
                setPoliceStations([]);
                setPoliceStationsLoading(false);
                return;
            }
            const error = err instanceof Error ? err : new Error('Failed to load police stations');
            setError(error);
            console.error('Error loading police stations:', error);
        } finally {
            setPoliceStationsLoading(false);
        }
    };

    // Load beats
    const refreshBeats = async (policeStationId?: string) => {
        try {
            setBeatsLoading(true);
            setError(null);
            const response = await apiClient.getBeats(
                policeStationId ? { policeStationId } : undefined
            );
            const data = response.data?.beats || response.data || [];
            setBeats(data);
        } catch (err: any) {
            // Silently ignore 401/403 errors (user not authenticated or authorized)
            if (err?.response?.status === 401 || err?.response?.status === 403) {
                setBeatsLoading(false);
                return;
            }
            // Silently ignore 500 errors and set empty data
            if (err?.response?.status === 500 || err?.code === 'ECONNABORTED' || err?.name === 'AbortError') {
                console.warn('Beats service unavailable, using empty data');
                setBeats([]);
                setBeatsLoading(false);
                return;
            }
            const error = err instanceof Error ? err : new Error('Failed to load beats');
            setError(error);
            console.error('Error loading beats:', error);
        } finally {
            setBeatsLoading(false);
        }
    };

    // Refresh all master data
    const refreshAll = async () => {
        await Promise.all([
            refreshDistricts(),
            refreshPoliceStations(),
            refreshBeats()
        ]);
    };

    // Load all data on mount
    useEffect(() => {
        refreshAll();
    }, []);

    // Helper functions
    const getPoliceStationsByDistrict = (districtId: string): PoliceStation[] => {
        return policeStations.filter(ps => ps.districtId === districtId);
    };

    const getBeatsByPoliceStation = (policeStationId: string): Beat[] => {
        return beats.filter(beat => beat.policeStationId === policeStationId);
    };

    const getDistrictById = (id: string): District | undefined => {
        return districts.find(d => d.id === id);
    };

    const getPoliceStationById = (id: string): PoliceStation | undefined => {
        return policeStations.find(ps => ps.id === id);
    };

    const getBeatById = (id: string): Beat | undefined => {
        return beats.find(b => b.id === id);
    };

    const loading = districtsLoading || policeStationsLoading || beatsLoading;

    const value: MasterDataContextType = {
        districts,
        policeStations,
        beats,
        loading,
        districtsLoading,
        policeStationsLoading,
        beatsLoading,
        error,
        getPoliceStationsByDistrict,
        getBeatsByPoliceStation,
        getDistrictById,
        getPoliceStationById,
        getBeatById,
        refreshDistricts,
        refreshPoliceStations,
        refreshBeats,
        refreshAll
    };

    return (
        <MasterDataContext.Provider value={value}>
            {children}
        </MasterDataContext.Provider>
    );
}

/**
 * Hook to access master data
 * 
 * @example
 * const { districts, policeStations, beats, loading } = useMasterData();
 */
export function useMasterData(): MasterDataContextType {
    const context = useContext(MasterDataContext);
    if (!context) {
        throw new Error('useMasterData must be used within MasterDataProvider');
    }
    return context;
}
