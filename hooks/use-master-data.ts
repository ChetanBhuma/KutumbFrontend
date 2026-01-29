import { useCallback, useMemo } from 'react';
import apiClient from '@/lib/api-client';
import { useApiQuery } from './use-api-query';

export interface District {
    id: string;
    name: string;
    code: string;
    range: string;
}

export interface PoliceStation {
    id: string;
    name: string;
    code: string;
    districtId: string;
}

export interface Beat {
    id: string;
    name: string;
    code: string;
    policeStationId: string;
}

export interface LivingArrangement {
    id: string;
    name: string;
    description?: string;
}

export interface HealthCondition {
    id: string;
    name: string;
    category?: string;
}

export function useMasterData() {
    const fetchAllMasters = useCallback(() => apiClient.getPublicMasters(), []);

    const {
        data: masterData,
        loading,
        error
    } = useApiQuery<any>(fetchAllMasters, { refetchOnMount: true });

    const districts = useMemo(() => masterData?.districts || [], [masterData]);
    const policeStations = useMemo(() => masterData?.policeStations || [], [masterData]);
    const beats = useMemo(() => masterData?.beats || [], [masterData]);
    const livingArrangements = useMemo(() => masterData?.livingArrangements || [], [masterData]);
    const healthConditions = useMemo(() => masterData?.healthConditions || [], [masterData]);

    const systemMasters = useMemo(() => masterData?.systemMasters || {}, [masterData]);

    const getPoliceStationsByDistrict = useCallback((districtId: string) => {
        if (!districtId || !policeStations.length) return [];
        return policeStations.filter((ps: any) => ps.districtId === districtId);
    }, [policeStations]);

    const getBeatsByPoliceStation = useCallback((stationId: string) => {
        if (!stationId || !beats.length) return [];
        return beats.filter((b: any) => b.policeStationId === stationId);
    }, [beats]);

    return {
        districts,
        policeStations,
        beats,
        livingArrangements,
        healthConditions,
        systemMasters,
        loading,
        error,
        getPoliceStationsByDistrict,
        getBeatsByPoliceStation
    };
}
