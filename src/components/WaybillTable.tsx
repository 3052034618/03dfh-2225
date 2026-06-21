import { Link } from 'react-router-dom';
import { Eye, Thermometer, FileText, ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert, CheckCircle2, ListTodo, ArrowUpCircle, CheckCheck } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatStatus, formatTempRange, getStatusBadgeClass, formatRiskLevel, getRiskLevelBadgeClass, formatTicketStatus, getTicketStatusBadgeClass, formatTicketPriority, getTicketPriorityBadgeClass } from '@/utils/format';
import type { Waybill, DisputeTicket } from '@/types';
import { CreateTicketModal } from './CreateTicketModal';

export const WaybillTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [selectedWaybillForTicket, setSelectedWaybillForTicket] = useState<Waybill | null>(null);
  const pageSize = 10;

  const waybills = useAppStore((state) => state.waybills);
  const disputeTickets = useAppStore((state) => state.disputeTickets);
  const searchFilters = useAppStore((state) => state.searchFilters);
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);
  const setSelectedWaybill = useAppStore((state) => state.setSelectedWaybill);
  const updateDisputeTicket = useAppStore((state) => state.updateDisputeTicket);

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
      const matchesRisk = searchFilters.riskLevel && searchFilters.riskLevel !== 'all'
        ? waybill.riskLevel === searchFilters.riskLevel
        : true;
      return matchesId && matchesCustomer && matchesDate && matchesRisk;
    });
  }, [waybills, searchFilters]);

  const filteredTickets = useMemo(() => {
    return disputeTickets.filter((ticket) => {
      const matchesId = searchFilters.waybillId
        ? ticket.waybillId.toLowerCase().includes(searchFilters.waybillId.toLowerCase())
        : true;
      const matchesCustomer = searchFilters.customerName
        ? ticket.customerName.toLowerCase().includes(searchFilters.customerName.toLowerCase())
        : true;
      const matchesRisk = searchFilters.riskLevel && searchFilters.riskLevel !== 'all'
        ? ticket.riskLevel === searchFilters.riskLevel
        : true;
      const matchesStatus = searchFilters.ticketStatus && searchFilters.ticketStatus !== 'all'
        ? ticket.status === searchFilters.ticketStatus
        : true;
      return matchesId && matchesCustomer && matchesRisk && matchesStatus;
    });
  }, [disputeTickets, searchFilters]);

  const currentData = searchFilters.viewMode === 'ticket' ? filteredTickets : filteredWaybills;
  const totalPages = Math.ceil(currentData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const displayedData = currentData.slice(startIndex, startIndex + pageSize);

  const handleRowClick = (waybill: Waybill) => {
    setSelectedWaybill(waybill);
  };

  const handleCreateTicket = (waybill: Waybill) => {
    setSelectedWaybillForTicket(waybill);
    setTicketModalOpen(true);
  };

  const handleResolveTicket = (ticketId: string) => {
    updateDisputeTicket(ticketId, { status: 'resolved' });
  };

  const handleEscalateTicket = (ticketId: string) => {
    updateDisputeTicket(ticketId, { status: 'escalated' });
  };

  return (
    <>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          {searchFilters.viewMode === 'waybill' ? (
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
                    合规率
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    风险等级
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
                {(displayedData as Waybill[]).map((waybill, index) => {
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
                      <td className="px-6 py-4">
                        <span className={`font-mono text-sm font-medium ${
                          waybill.complianceRate >= 99 ? 'text-success-600' :
                          waybill.complianceRate >= 95 ? 'text-warning-600' : 'text-danger-600'
                        }`}>
                          {waybill.complianceRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 ${getRiskLevelBadgeClass(waybill.riskLevel)}`}>
                          {waybill.riskLevel === 'severe' && <ShieldAlert className="w-3 h-3" />}
                          {waybill.riskLevel === 'minor' && <AlertTriangle className="w-3 h-3" />}
                          {waybill.riskLevel === 'compliant' && <CheckCircle2 className="w-3 h-3" />}
                          {formatRiskLevel(waybill.riskLevel)}
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
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateTicket(waybill);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-warning-50 text-warning-700 hover:bg-warning-100 transition-colors"
                            title="创建工单"
                          >
                            <ListTodo className="w-3.5 h-3.5" />
                            创建工单
                          </button>
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
                {displayedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-6 py-12 text-center text-neutral-500"
                    >
                      <Eye className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                      <p>暂无符合条件的运单</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    工单编号
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    关联运单号
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    客户名称
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    风险等级
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    工单状态
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    优先级
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    负责人
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    创建时间
                  </th>
                  <th className="text-center px-6 py-3.5 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {(displayedData as DisputeTicket[]).map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    className={`transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                    } hover:bg-neutral-50`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/trace/${ticket.waybillId}`}
                        className="font-mono text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {ticket.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/trace/${ticket.waybillId}`}
                        className="font-mono text-sm text-neutral-700 hover:text-primary-600 hover:underline"
                      >
                        {ticket.waybillId}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {ticket.customerName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 ${getRiskLevelBadgeClass(ticket.riskLevel)}`}>
                        {ticket.riskLevel === 'severe' && <ShieldAlert className="w-3 h-3" />}
                        {ticket.riskLevel === 'minor' && <AlertTriangle className="w-3 h-3" />}
                        {ticket.riskLevel === 'compliant' && <CheckCircle2 className="w-3 h-3" />}
                        {formatRiskLevel(ticket.riskLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getTicketStatusBadgeClass(ticket.status)}>
                        {formatTicketStatus(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={getTicketPriorityBadgeClass(ticket.priority)}>
                        P{ticket.priority === 'low' ? '3' : ticket.priority === 'medium' ? '2' : '1'} · {formatTicketPriority(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {ticket.assignee}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-700">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {ticket.status !== 'resolved' && (
                          <button
                            type="button"
                            onClick={() => handleResolveTicket(ticket.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-success-50 text-success-700 hover:bg-success-100 transition-colors"
                            title="标记已解决"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            标记已解决
                          </button>
                        )}
                        {ticket.status !== 'escalated' && ticket.status !== 'resolved' && (
                          <button
                            type="button"
                            onClick={() => handleEscalateTicket(ticket.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-danger-50 text-danger-700 hover:bg-danger-100 transition-colors"
                            title="升级处理"
                          >
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            升级处理
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {displayedData.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-neutral-500"
                    >
                      <ListTodo className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                      <p>暂无符合条件的工单</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50">
            <p className="text-sm text-neutral-500">
              共 <span className="font-medium text-neutral-700">{currentData.length}</span> 条记录
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

      <CreateTicketModal
        isOpen={ticketModalOpen}
        onClose={() => {
          setTicketModalOpen(false);
          setSelectedWaybillForTicket(null);
        }}
        waybillId={selectedWaybillForTicket?.id}
        waybillData={selectedWaybillForTicket || undefined}
      />
    </>
  );
};
