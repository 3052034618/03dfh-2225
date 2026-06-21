import { Link } from 'react-router-dom';
import { Eye, Thermometer, FileText, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatStatus, formatTempRange, getStatusBadgeClass } from '@/utils/format';

export const WaybillTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const waybills = useAppStore((state) => state.waybills);
  const searchFilters = useAppStore((state) => state.searchFilters);
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);
  const setSelectedWaybill = useAppStore((state) => state.setSelectedWaybill);

  const filteredWaybills = useMemo(() => {
    return waybills.filter((waybill) => {
      const matchesId = searchFilters.waybillId
        ? waybill.id.toLowerCase().includes(searchFilters.waybillId.toLowerCase())
        : true;
      const matchesCustomer = searchFilters.customerName
        ? waybill.customerName
            .toLowerCase()
            .includes(searchFilters.customerName.toLowerCase())
        : true;
      const matchesDate = searchFilters.shipmentDate
        ? waybill.shipmentDate === searchFilters.shipmentDate
        : true;
      return matchesId && matchesCustomer && matchesDate;
    });
  }, [waybills, searchFilters]);

  const totalPages = Math.ceil(filteredWaybills.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const displayedWaybills = filteredWaybills.slice(startIndex, startIndex + pageSize);

  const handleRowClick = (waybill: typeof filteredWaybills[0]) => {
    setSelectedWaybill(waybill);
  };

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                运单号
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                客户名称
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                运输线路
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                货品类型
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                要求温区
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                发货日期
              </th>
              <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                状态
              </th>
              <th className="text-center px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {displayedWaybills.map((waybill, index) => {
              const isSelected = selectedWaybill?.id === waybill.id;
              return (
                <tr
                  key={waybill.id}
                  className={`transition-colors cursor-pointer ${
                    index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                  } ${isSelected ? 'bg-primary-50/50' : 'hover:bg-neutral-50'}`}
                  onClick={() => handleRowClick(waybill)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-neutral-800">
                      {waybill.id}
                    </span>
                    {waybill.alertCount > 0 && (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs text-danger-600">
                        <AlertTriangle className="w-3 h-3" />
                        {waybill.alertCount}次
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {waybill.customerName}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    <span className="inline-flex items-center gap-1.5">
                      {waybill.origin}
                      <span className="text-neutral-400">→</span>
                      {waybill.destination}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {waybill.goodsType}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-neutral-800">
                      {formatTempRange(waybill.tempMin, waybill.tempMax)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-700">
                    {formatDate(waybill.shipmentDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={getStatusBadgeClass(waybill.currentStatus)}>
                      {formatStatus(waybill.currentStatus)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/trace/${waybill.id}`}
                        className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                        title="查看温度留痕"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Thermometer className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/certificate/${waybill.id}`}
                        className="p-2 rounded-lg text-success-600 hover:bg-success-50 transition-colors"
                        title="生成证明材料"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {displayedWaybills.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-12 text-center text-neutral-500"
                >
                  <Eye className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                  <p>暂无符合条件的运单</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          <p className="text-sm text-neutral-500">
            共 <span className="font-medium text-neutral-700">{filteredWaybills.length}</span> 条记录
          </p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-primary-500 text-white'
                    : 'text-neutral-600 hover:bg-white border border-transparent hover:border-neutral-300'
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="p-2 rounded-lg border border-neutral-300 text-neutral-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
