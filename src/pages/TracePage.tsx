import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UnifiedTimeline } from '@/components/UnifiedTimeline';
import { StatsCard } from '@/components/StatsCard';
import { useAppStore } from '@/store/useAppStore';
import {
  Package,
  Route,
  ThermometerSun,
  Truck,
  User,
  Phone,
  FileText,
  ArrowLeft,
  Users,
  AlertTriangle,
  TrendingUp,
  ShieldAlert,
  Clock,
  ChevronRight,
} from 'lucide-react';
import {
  formatTempRange,
  formatStatus,
  getStatusBadgeClass,
  formatDate,
  formatPercentage,
  getRiskLevelBadgeClass,
} from '@/utils/format';

export const TracePage = () => {
  const { id } = useParams<{ id: string }>();
  const waybills = useAppStore((state) => state.waybills);
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);
  const setSelectedWaybill = useAppStore((state) => state.setSelectedWaybill);
  const temperatureReadings = useAppStore((state) => state.temperatureReadings);
  const timelineEvents = useAppStore((state) => state.timelineEvents);
  const alertRecords = useAppStore((state) => state.alertRecords);
  const handlingActions = useAppStore((state) => state.handlingActions);
  const getCustomerExceptionSummary = useAppStore((state) => state.getCustomerExceptionSummary);
  const disputeTickets = useAppStore((state) => state.disputeTickets);

  const customerSummary = useMemo(() => {
    if (!selectedWaybill) return null;
    return getCustomerExceptionSummary(selectedWaybill.customerName);
  }, [selectedWaybill, getCustomerExceptionSummary]);

  const customerTickets = useMemo(() => {
    if (!selectedWaybill) return [];
    return disputeTickets.filter((t) => t.customerName === selectedWaybill.customerName);
  }, [selectedWaybill, disputeTickets]);

  const customerRiskWaybills = useMemo(() => {
    if (!customerSummary) return [];
    return waybills.filter((w) => customerSummary.riskWaybills.includes(w.id));
  }, [customerSummary, waybills]);

  useEffect(() => {
    if (id) {
      const waybill = waybills.find((w) => w.id === id);
      if (waybill) {
        setSelectedWaybill(waybill);
      }
    }
  }, [id, waybills, setSelectedWaybill]);

  if (!selectedWaybill) {
    return (
      <div className="card p-12 text-center">
        <Package className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
        <h2 className="text-xl font-semibold text-neutral-800 mb-2">未找到运单</h2>
        <p className="text-neutral-500 mb-4">请返回运单检索页面选择有效运单</p>
        <Link to="/search" className="btn-primary inline-flex">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回运单检索
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/search"
              className="p-2 rounded-lg hover:bg-white transition-colors text-neutral-500 hover:text-neutral-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-neutral-800">温度留痕视图</h1>
            <span className="font-mono text-sm bg-primary-100 text-primary-700 px-2.5 py-1 rounded-md">
              {selectedWaybill.id}
            </span>
            <span className={getStatusBadgeClass(selectedWaybill.currentStatus)}>
              {formatStatus(selectedWaybill.currentStatus)}
            </span>
          </div>
          <p className="text-neutral-500 ml-11">
            {selectedWaybill.customerName} - {selectedWaybill.route}
          </p>
        </div>
        <Link
          to={`/certificate/${selectedWaybill.id}`}
          className="btn-primary"
        >
          <FileText className="w-4 h-4 mr-2" />
          生成证明材料
        </Link>
      </div>

      <StatsCard />

      {customerSummary && customerSummary.last30DaysAlerts > 0 && (
        <div className="card p-6 mb-6 border-warning-200 bg-gradient-to-br from-warning-50/30 to-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-800 flex items-center gap-2">
                  客户维度异常汇总
                  <span className="text-xs font-normal text-neutral-500">
                    {selectedWaybill?.customerName}
                  </span>
                </h3>
                <p className="text-xs text-neutral-500">
                  近30天该客户累计出现 {customerSummary.last30DaysAlerts} 次温度异常
                </p>
              </div>
            </div>
            {customerSummary.last30DaysAlerts >= 5 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-danger-100 text-danger-700 text-xs font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                建议统一解释或升级处理
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
            <div className="bg-white rounded-lg p-3 border border-neutral-200">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Package className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-xs text-neutral-500">累计运单</span>
              </div>
              <p className="text-lg font-bold text-neutral-800">
                {customerSummary.totalWaybills}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                近30天 {customerSummary.last30DaysWaybills} 单
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-neutral-200">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-warning-500" />
                <span className="text-xs text-neutral-500">累计异常</span>
              </div>
              <p className="text-lg font-bold text-neutral-800">
                {customerSummary.totalAlerts}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                近30天 {customerSummary.last30DaysAlerts} 次
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-neutral-200">
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-danger-500" />
                <span className="text-xs text-neutral-500">严重/轻微</span>
              </div>
              <p className="text-lg font-bold text-neutral-800">
                <span className="text-danger-600">{customerSummary.severeAlerts}</span>
                <span className="text-neutral-400 mx-1">/</span>
                <span className="text-warning-600">{customerSummary.minorAlerts}</span>
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                严重 / 轻微异常次数
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-neutral-200">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-success-500" />
                <span className="text-xs text-neutral-500">平均合规率</span>
              </div>
              <p className={`text-lg font-bold ${
                customerSummary.complianceRateAvg >= 98 ? 'text-success-600' :
                customerSummary.complianceRateAvg >= 95 ? 'text-warning-600' : 'text-danger-600'
              }`}>
                {formatPercentage(customerSummary.complianceRateAvg)}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                全部运单加权平均
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-neutral-200">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-xs text-neutral-500">关联工单</span>
              </div>
              <p className="text-lg font-bold text-neutral-800">
                {customerTickets.length}
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">
                未处理 {customerTickets.filter(t => t.status !== 'resolved').length} 单
              </p>
            </div>
          </div>

          {customerRiskWaybills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-700 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-warning-500" />
                同客户近期风险运单 ({customerRiskWaybills.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {customerRiskWaybills.map((wb) => (
                  <Link
                    key={wb.id}
                    to={`/trace/${wb.id}`}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all hover:shadow-sm ${
                      wb.id === selectedWaybill?.id
                        ? 'bg-primary-100 border-primary-300 text-primary-700'
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-600'
                    }`}
                  >
                    <span className="font-mono">{wb.id}</span>
                    <span className={getRiskLevelBadgeClass(wb.riskLevel)} style={{ padding: '1px 6px', fontSize: '10px' }}>
                      {wb.riskLevel === 'compliant' ? '合规' : wb.riskLevel === 'minor' ? '轻微' : '严重'}
                    </span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <Truck className="w-3 h-3" />
              客户名称
            </p>
            <p className="text-sm font-medium text-neutral-800">
              {selectedWaybill.customerName}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <Route className="w-3 h-3" />
              运输线路
            </p>
            <p className="text-sm font-medium text-neutral-800">
              {selectedWaybill.route}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <Package className="w-3 h-3" />
              货品类型
            </p>
            <p className="text-sm font-medium text-neutral-800">
              {selectedWaybill.goodsType}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <ThermometerSun className="w-3 h-3" />
              要求温区
            </p>
            <p className="text-sm font-mono font-medium text-neutral-800">
              {formatTempRange(selectedWaybill.tempMin, selectedWaybill.tempMax)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              司机 / 车辆
            </p>
            <p className="text-sm font-medium text-neutral-800">
              {selectedWaybill.driverName} / {selectedWaybill.vehicleNo}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3" />
              发货日期
            </p>
            <p className="text-sm font-medium text-neutral-800">
              {formatDate(selectedWaybill.shipmentDate)}
            </p>
          </div>
        </div>
      </div>

      <UnifiedTimeline
        readings={temperatureReadings}
        minTemp={selectedWaybill.tempMin}
        maxTemp={selectedWaybill.tempMax}
        alerts={alertRecords}
        events={timelineEvents}
        handlingActions={handlingActions}
        driverName={selectedWaybill.driverName}
        driverPhone={selectedWaybill.driverPhone}
        vehicleNo={selectedWaybill.vehicleNo}
      />
    </div>
  );
};
