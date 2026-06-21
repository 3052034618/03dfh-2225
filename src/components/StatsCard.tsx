import { ReactNode } from 'react';
import { Clock, Thermometer, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  formatDurationHours,
  formatPercentage,
  formatTemperature,
} from '@/utils/format';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  gradient: string;
  iconBg: string;
  delay?: number;
}

const StatCard = ({ icon, label, value, gradient, iconBg, delay = 0 }: StatCardProps) => (
  <div
    className={`card p-5 bg-gradient-to-br ${gradient} animate-fade-in`}
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-neutral-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-neutral-800">{value}</p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  </div>
);

export const StatsCard = () => {
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);

  if (!selectedWaybill) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="card p-5 h-24 animate-pulse bg-neutral-100"
            style={{ animationDelay: `${i * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  const stats = [
    {
      icon: <Clock className="w-5 h-5 text-primary-600" />,
      label: '运输总时长',
      value: formatDurationHours(selectedWaybill.totalDuration),
      gradient: 'from-primary-50 to-white',
      iconBg: 'bg-primary-100',
      delay: 0,
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-success-600" />,
      label: '温度合规率',
      value: formatPercentage(selectedWaybill.complianceRate),
      gradient: 'from-success-50 to-white',
      iconBg: 'bg-success-100',
      delay: 100,
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-danger-600" />,
      label: '报警次数',
      value: `${selectedWaybill.alertCount} 次`,
      gradient: 'from-danger-50 to-white',
      iconBg: 'bg-danger-100',
      delay: 200,
    },
    {
      icon: <Thermometer className="w-5 h-5 text-warning-600" />,
      label: '要求温区',
      value: `${formatTemperature(selectedWaybill.tempMin)} ~ ${formatTemperature(selectedWaybill.tempMax)}`,
      gradient: 'from-warning-50 to-white',
      iconBg: 'bg-warning-100',
      delay: 300,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
