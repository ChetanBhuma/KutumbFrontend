'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Trophy,
  Award,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Calendar,
  Shield,
  Loader2
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

interface SHOLeaderboardProps {
  officers?: any[];
  visits?: any[];
  policeStationId?: string;
  loading?: boolean;
}

export function SHOOfficerLeaderboard({
  officers: propOfficers,
  visits: propVisits,
  policeStationId,
  loading: propLoading
}: SHOLeaderboardProps) {
  const [internalOfficers, setInternalOfficers] = useState<any[]>([]);
  const [internalVisits, setInternalVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (propOfficers && propVisits) return;
    try {
      setLoading(true);
      const [offRes, visitsRes]: any = await Promise.all([
        apiClient.get('/officers', { params: policeStationId ? { policeStationId } : {} }),
        apiClient.get('/visits', { params: { limit: 100, ...(policeStationId ? { policeStationId } : {}) } })
      ]);

      const fetchedOffs = offRes?.data?.officers || offRes?.data?.items || (Array.isArray(offRes?.data) ? offRes.data : []) || [];
      const fetchedVisits = visitsRes?.data?.visits || visitsRes?.data?.items || (Array.isArray(visitsRes?.data) ? visitsRes.data : []) || [];

      setInternalOfficers(fetchedOffs);
      setInternalVisits(fetchedVisits);
    } catch (err) {
      console.error('Failed to load leaderboard data', err);
    } finally {
      setLoading(false);
    }
  }, [policeStationId, propOfficers, propVisits]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const officers = propOfficers || internalOfficers;
  const visits = propVisits || internalVisits;
  const isLoading = propLoading !== undefined ? propLoading : loading;

  // Compute officer performance metrics
  const officerStats = officers.map((officer) => {
    const officerVisits = visits.filter(v => v.officerId === officer.id);
    const completedVisits = officerVisits.filter(v => v.status === 'COMPLETED').length;
    const totalAssigned = officerVisits.length;
    const completionRate = totalAssigned > 0 ? Math.round((completedVisits / totalAssigned) * 100) : 100;

    return {
      id: officer.id,
      name: officer.name,
      rank: officer.rank || 'Constable',
      badgeNumber: officer.badgeNumber,
      beatName: officer.Beat?.name || 'Station Reserve',
      completedVisits,
      totalAssigned,
      completionRate
    };
  });

  // Sort by completed visits descending
  officerStats.sort((a, b) => b.completedVisits - a.completedVisits);

  const handleExportData = async (type: 'citizens' | 'visits' | 'sos') => {
    try {
      setExporting(type);
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/reports/export?type=${type}&format=csv${policeStationId ? `&policeStationId=${policeStationId}` : ''}`;
      
      window.open(url, '_blank');
      toast.success(`${type.toUpperCase()} compliance report downloaded successfully.`);
    } catch (error: any) {
      console.error('Export failed', error);
      toast.error('Failed to export report.');
    } finally {
      setExporting(null);
    }
  };

  if (isLoading && officers.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="font-medium">Loading officer performance leaderboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Export Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Beat Officer Duty Performance & Report Download</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Check how many visits each beat officer has completed and download official reports in Excel/CSV.
          </p>
        </div>

        {/* Quick Export Hub */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportData('citizens')}
            disabled={!!exporting}
            className="h-8 text-xs font-semibold gap-1.5 border-slate-300"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            Download Citizen List (CSV)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportData('visits')}
            disabled={!!exporting}
            className="h-8 text-xs font-semibold gap-1.5 border-slate-300"
          >
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            Download Visits Report (CSV)
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExportData('sos')}
            disabled={!!exporting}
            className="h-8 text-xs font-semibold gap-1.5 border-slate-300"
          >
            <Download className="h-3.5 w-3.5 text-red-600" />
            Download SOS Report (CSV)
          </Button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <Table>
          <TableHeader className="bg-slate-50/90">
            <TableRow>
              <TableHead className="w-12 text-center">Rank</TableHead>
              <TableHead>Officer Details</TableHead>
              <TableHead>Assigned Beat Area</TableHead>
              <TableHead className="text-center">Visits Completed</TableHead>
              <TableHead className="text-center">Total Assigned</TableHead>
              <TableHead className="text-center">Completion Rate (%)</TableHead>
              <TableHead className="text-right">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officerStats.map((off, idx) => {
              return (
                <TableRow key={off.id} className="hover:bg-slate-50/70 transition-colors">
                  <TableCell className="text-center font-bold text-slate-700">
                    {idx === 0 ? (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-800 text-xs">
                        🥇
                      </span>
                    ) : idx === 1 ? (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 text-slate-800 text-xs">
                        🥈
                      </span>
                    ) : idx === 2 ? (
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-700/20 text-amber-900 text-xs">
                        🥉
                      </span>
                    ) : (
                      `#${idx + 1}`
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900">{off.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {off.rank} • Badge: {off.badgeNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-semibold bg-slate-50">
                      <MapPin className="h-3 w-3 mr-1 text-primary" />
                      {off.beatName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-black text-slate-900">
                    {off.completedVisits}
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-600">
                    {off.totalAssigned}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`font-bold text-xs ${off.completionRate >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {off.completionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${
                        off.completedVisits >= 5
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : off.completedVisits > 0
                          ? 'bg-blue-50 text-blue-800 border-blue-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {off.completedVisits >= 5 ? 'Excellent Duty' : off.completedVisits > 0 ? 'Active on Field' : 'No Visits Yet'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
