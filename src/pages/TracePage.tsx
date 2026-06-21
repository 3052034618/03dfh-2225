import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TempChart } from '@/components/TempChart';
import { Timeline } from '@/components/Timeline';
import { DetailPanel } from '@/components/DetailPanel';
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
} from 'lucide-react';
import {
  formatTempRange,
  formatStatus,
  getStatusBadgeClass,
  formatDate,
} from '@/utils/format';

export const TracePage = () => {
  const { id } = useParams<{ id: string }>();
  const waybills = useAppStore((state) => state.waybills);
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);
  const setSelectedWaybill = useAppStore((state) => state.setSelectedWaybill);
  const temperatureReadings = useAppStore((state) => state.temperatureReadings);
  const timelineEvents = useAppStore((state) => state.timelineEvents);
  const alertRecords = useAppStore((state) => state.alertRecords);
  const selectedAlertId = useAppStore((state) => state.selectedAlertId);
  const setSelectedAlertId = useAppStore((state) => state.setSelectedAlertId);

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

      <div className="mb-6">
        <TempChart
          readings={temperatureReadings}
          minTemp={selectedWaybill.tempMin}
          maxTemp={selectedWaybill.tempMax}
          alerts={alertRecords}
        />
      </div>

      <Timeline events={timelineEvents} />

      <DetailPanel
        isOpen={!!selectedAlertId}
        onClose={() => setSelectedAlertId(null)}
      />
    </div>
  );
};
