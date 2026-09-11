'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Siren,
  ShieldCheck,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  MapPin,
  CheckCircle2,
  FileCheck,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SHOKpiGridProps {
  stats: any;
  onSelectTab?: (tab: string) => void;
  activeTab?: string;
}

export function SHOKpiGrid({ stats, onSelectTab, activeTab }: SHOKpiGridProps) {
  const activeSOS = stats?.sos?.active ?? 0;
  const totalVerifications = stats?.pendingQueues?.verificationRequests ?? stats?.citizens?.pending ?? 0;
  const citizenVerifications = stats?.pendingQueues?.citizenVerifications ?? totalVerifications;
  const staffVerifications = stats?.pendingQueues?.staffVerifications ?? 0;

  const todayScheduled = stats?.visits?.todayScheduled ?? 0;
  const todayCompleted = stats?.visits?.todayCompleted ?? 0;
  const revisitsDue = stats?.visits?.revisitsDue ?? stats?.pendingQueues?.revisitRequests ?? 0;

  const highVulnerability = stats?.citizens?.highVulnerability ?? 0;
  const overdueVisits = stats?.citizens?.overdueHighRiskVisits ?? 0;

  const totalOfficers = stats?.officers?.total ?? (stats?.officers?.assigned ?? 0) + (stats?.officers?.unassigned ?? 0);
  const assignedOfficers = stats?.officers?.assigned ?? 0;
  const unassignedOfficers = stats?.officers?.unassigned ?? 0;

  const totalBeats = stats?.beats?.total ?? 0;
  const mannedBeats = stats?.beats?.manned ?? 0;
  const unassignedBeats = stats?.beats?.unassigned ?? 0;
  const beatCoverage = stats?.beats?.coverageRate ?? (totalBeats > 0 ? ((mannedBeats / totalBeats) * 100).toFixed(0) : 100);

  const totalCitizens = stats?.citizens?.total ?? 0;
  const verifiedCitizens = stats?.citizens?.verified ?? 0;

  const kpis = [
    {
      id: 'sos',
      title: 'Active SOS Alerts',
      value: activeSOS,
      subtext: activeSOS > 0 ? `${activeSOS} Emergency calls` : 'All clear',
      icon: Siren,
      borderClass: activeSOS > 0 ? 'border-l-red-500 hover:border-red-600' : 'border-l-slate-400 hover:border-slate-500',
      cardBg: activeSOS > 0
        ? 'bg-gradient-to-br from-red-50/60 via-white to-slate-50/40 dark:from-red-950/20 dark:via-slate-900 dark:to-slate-950'
        : 'bg-gradient-to-br from-slate-50/60 via-white to-slate-50/40 dark:from-slate-900/40 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/25',
      iconBg: activeSOS > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      countBadge: activeSOS > 0
        ? 'bg-red-50/90 text-red-700 border border-red-200/70 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800/60'
        : 'bg-slate-100 text-slate-700 border border-slate-200/70 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      active: activeTab === 'sos',
      tabTarget: 'sos'
    },
    {
      id: 'verifications',
      title: 'Pending Verifications',
      value: totalVerifications,
      subtext: `${citizenVerifications} Citizens • ${staffVerifications} Staff`,
      icon: ShieldCheck,
      borderClass: totalVerifications > 0 ? 'border-l-blue-500 hover:border-blue-600' : 'border-l-slate-300',
      cardBg: 'bg-gradient-to-br from-blue-50/60 via-white to-slate-50/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25',
      iconBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      countBadge: 'bg-blue-50/90 text-blue-700 border border-blue-200/70 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60',
      active: activeTab === 'verifications',
      tabTarget: 'verifications'
    },
    {
      id: 'today_visits',
      title: "Today's Visits",
      value: `${todayCompleted}/${todayScheduled}`,
      subtext: todayScheduled > 0 ? `${Math.round((todayCompleted / todayScheduled) * 100)}% completed` : 'No visits today',
      icon: Calendar,
      borderClass: 'border-l-emerald-500 hover:border-emerald-600',
      cardBg: 'bg-gradient-to-br from-emerald-50/60 via-white to-slate-50/40 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25',
      iconBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
      countBadge: 'bg-emerald-50/90 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60',
      active: activeTab === 'visits',
      tabTarget: 'revisits'
    },
    {
      id: 'revisits',
      title: 'Follow-up Visits Due',
      value: revisitsDue,
      subtext: overdueVisits > 0 ? `${overdueVisits} overdue` : 'Regular visits',
      icon: Clock,
      borderClass: revisitsDue > 0 ? 'border-l-amber-500 hover:border-amber-600' : 'border-l-slate-300',
      cardBg: 'bg-gradient-to-br from-amber-50/60 via-white to-slate-50/40 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25',
      iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
      countBadge: 'bg-amber-50/90 text-amber-700 border border-amber-200/70 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60',
      active: activeTab === 'revisits',
      tabTarget: 'revisits'
    },
    {
      id: 'high_risk',
      title: 'High Attention Seniors',
      value: highVulnerability,
      subtext: `${overdueVisits} overdue visits`,
      icon: AlertTriangle,
      borderClass: 'border-l-purple-500 hover:border-purple-600',
      cardBg: 'bg-gradient-to-br from-purple-50/60 via-white to-slate-50/40 dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/25',
      iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      countBadge: 'bg-purple-50/90 text-purple-700 border border-purple-200/70 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60',
      active: activeTab === 'high_risk',
      tabTarget: 'revisits'
    },
    {
      id: 'officers',
      title: 'Police Station Staff',
      value: totalOfficers,
      subtext: `${assignedOfficers} on beat • ${unassignedOfficers} in reserve`,
      icon: UserCheck,
      borderClass: 'border-l-indigo-500 hover:border-indigo-600',
      cardBg: 'bg-gradient-to-br from-indigo-50/60 via-white to-slate-50/40 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/25',
      iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
      countBadge: 'bg-indigo-50/90 text-indigo-700 border border-indigo-200/70 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60',
      active: activeTab === 'roster',
      tabTarget: 'roster'
    },
    {
      id: 'beats',
      title: 'Beat Area Coverage',
      value: `${beatCoverage}%`,
      subtext: `${mannedBeats}/${totalBeats} active beats`,
      icon: MapPin,
      borderClass: unassignedBeats > 0 ? 'border-l-rose-500 hover:border-rose-600' : 'border-l-teal-500 hover:border-teal-600',
      cardBg: 'bg-gradient-to-br from-teal-50/60 via-white to-slate-50/40 dark:from-teal-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-500/25',
      iconBg: unassignedBeats > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' : 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300',
      countBadge: 'bg-teal-50/90 text-teal-700 border border-teal-200/70 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60',
      active: activeTab === 'beats',
      tabTarget: 'roster'
    },
    {
      id: 'citizens',
      title: 'Registered Citizens',
      value: totalCitizens.toLocaleString(),
      subtext: `${verifiedCitizens} verified`,
      icon: Users,
      borderClass: 'border-l-sky-500 hover:border-sky-600',
      cardBg: 'bg-gradient-to-br from-sky-50/60 via-white to-slate-50/40 dark:from-sky-950/20 dark:via-slate-900 dark:to-slate-950',
      activeCardBg: 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/25',
      iconBg: 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
      countBadge: 'bg-sky-50/90 text-sky-700 border border-sky-200/70 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60',
      active: activeTab === 'citizens',
      tabTarget: 'verifications'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={kpi.id}
            onClick={() => onSelectTab && onSelectTab(kpi.tabTarget)}
            className={cn(
              'group relative shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer backdrop-blur-sm select-none hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] overflow-hidden',
              kpi.active
                ? cn('border-0 ring-0', kpi.activeCardBg)
                : cn('border border-slate-200/70 dark:border-slate-800 border-l-[3.5px]', kpi.borderClass, kpi.cardBg)
            )}
          >
            <CardContent className="p-2.5 px-3">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      'p-1.5 rounded-md shrink-0 transition-transform group-hover:scale-105 shadow-xs',
                      kpi.active ? 'bg-white/20 text-white' : kpi.iconBg
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'text-xs font-semibold tracking-tight truncate leading-tight transition-colors',
                        kpi.active
                          ? 'text-white font-bold'
                          : 'text-slate-800 dark:text-slate-200 group-hover:text-primary'
                      )}
                    >
                      {kpi.title}
                    </p>
                    <p
                      className={cn(
                        'text-[10px] truncate leading-tight mt-0.5 font-medium',
                        kpi.active ? 'text-white/85' : 'text-muted-foreground'
                      )}
                    >
                      {kpi.subtext}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <div
                    className={cn(
                      'text-base font-black px-2 py-0.5 rounded-md tracking-tight shadow-xs min-w-[2.2rem] text-center transition-transform group-hover:scale-105',
                      kpi.active
                        ? 'bg-white text-slate-900 border-0 shadow-sm'
                        : kpi.countBadge
                    )}
                  >
                    {kpi.value}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

