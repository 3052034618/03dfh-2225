import { Search, RotateCcw, CalendarSearch, UserSearch, Barcode } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const SearchForm = () => {
  const searchFilters = useAppStore((state) => state.searchFilters);
  const setSearchFilters = useAppStore((state) => state.setSearchFilters);
  const resetSearchFilters = useAppStore((state) => state.resetSearchFilters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-primary-500" />
        运单检索
      </h2>

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
