'use client';

import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SHOAlertRibbonProps {
  activeSOS?: number;
  unassignedBeats: number;
  overdueVisits: number;
  pendingVerifications?: number;
  onSelectTab: (tab: string) => void;
}

export function SHOAlertRibbon({
  unassignedBeats,
  overdueVisits,
  onSelectTab
}: SHOAlertRibbonProps) {
  const hasAlerts = unassignedBeats > 0 || overdueVisits > 0;

  if (!hasAlerts) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Operational Warnings Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {unassignedBeats > 0 && (
          <div
            onClick={() => onSelectTab('roster')}
            className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg cursor-pointer hover:bg-amber-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <span className="text-xs font-semibold block">{unassignedBeats} Empty Beat{unassignedBeats > 1 ? 's' : ''}</span>
                <span className="text-[11px] text-amber-700">No officer assigned to this beat area</span>
              </div>
            </div>
            <Badge variant="outline" className="bg-amber-200/60 border-amber-300 text-amber-900 text-xs">
              Assign Officer
            </Badge>
          </div>
        )}

        {overdueVisits > 0 && (
          <div
            onClick={() => onSelectTab('revisits')}
            className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg cursor-pointer hover:bg-rose-100/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-rose-600 shrink-0" />
              <div>
                <span className="text-xs font-semibold block">{overdueVisits} Overdue Follow-up Visit{overdueVisits > 1 ? 's' : ''}</span>
                <span className="text-[11px] text-rose-700">Scheduled visit date has passed</span>
              </div>
            </div>
            <Badge variant="outline" className="bg-rose-200/60 border-rose-300 text-rose-900 text-xs">
              Schedule Visit
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
