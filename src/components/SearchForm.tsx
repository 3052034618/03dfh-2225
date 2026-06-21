import { Search, RotateCcw, CalendarSearch, UserSearch, Barcode, AlertTriangle, CheckCircle2, ShieldAlert, Filter } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { RiskLevel } from '@/types';

const riskOptions: { value: RiskLevel | 'all'; icon: React.ReactNode; label: string }[] = [
  { value: 'all', icon: <Filter className="w-4 h-4" />, label: '全部' },
  { value: 'severe', icon: <ShieldAlert className="w-4 h-4" />, label: '严重异常' },
  { value: 'minor', icon: <AlertTriangle className="w-4 h-4" />, label: '轻微异常' },
  { value: 'compliant', icon: <CheckCircle2 className="w-4 h-4" />, label: '全程合规' },
];

export const SearchForm = () => {
  const searchFilters = useAppStore((state) => state.searchFilters);
  const setSearchFilters = useAppStore((state) => state.setSearchFilters);
  const resetSearchFilters = useAppStore((state) => state.resetSearchFilters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="card p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary-500" />
          运单检索
        </h2>
        <div className="flex items-center gap-2">
          {riskOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSearchFilters({ riskLevel: option.value })}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                searchFilters.riskLevel === option.value
                  ? option.value === 'severe'
                    ? 'bg-danger-100 text-danger-700 ring-2 ring-danger-500/20'
                    : option.value === 'minor'
                    ? 'bg-warning-100 text-warning-700 ring-2 ring-warning-500/20'
                    : option.value === 'compliant'
                    ? 'bg-success-100 text-success-700 ring-2 ring-success-500/20'
                    : 'bg-primary-100 text-primary-700 ring-2 ring-primary-500/20'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="label flex items-center gap-1.5">
            <Barcode className="w-4 h-4 text-neutral-400" />
            运单号
          </label>
          <input
            type="text"
            className="input"
            placeholder="请输入运单号"
            value={searchFilters.waybillId}
            onChange={(e) => setSearchFilters({ waybillId: e.target.value })}
          />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <UserSearch className="w-4 h-4 text-neutral-400" />
            客户名称
          </label>
          <input
            type="text"
            className="input"
            placeholder="请输入客户名称"
            value={searchFilters.customerName}
            onChange={(e) => setSearchFilters({ customerName: e.target.value })}
          />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <CalendarSearch className="w-4 h-4 text-neutral-400" />
            发货日期
          </label>
          <input
            type="date"
            className="input"
            value={searchFilters.shipmentDate}
            onChange={(e) => setSearchFilters({ shipmentDate: e.target.value })}
          />
        </div>

        <div className="flex items-end gap-3">
          <button type="submit" className="btn-primary flex-1">
            <Search className="w-4 h-4 mr-2" />
            搜索
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={resetSearchFilters}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
