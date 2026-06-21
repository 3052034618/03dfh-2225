import { X, Clock, Thermometer, MapPin, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime, formatDuration, formatTemperature } from '@/utils/format';
import { maskPhone, maskName } from '@/utils/mask';

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isMasked?: boolean;
}

export const DetailPanel = ({ isOpen, onClose, isMasked = false }: DetailPanelProps) => {
  const selectedAlertId = useAppStore((state) => state.selectedAlertId);
  const alertRecords = useAppStore((state) => state.alertRecords);
  const handlingActions = useAppStore((state) => state.handlingActions);
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);

  const alert = useMemo(() => {
    return alertRecords.find((a) => a.id === selectedAlertId);
  }, [alertRecords, selectedAlertId]);

  const handlingAction = useMemo(() => {
    return handlingActions.find((a) => a.alertRecordId === selectedAlertId);
  }, [handlingActions, selectedAlertId]);

  if (!isOpen || !alert) {
    return null;
  }

  const maskedOperator = isMasked && handlingAction ? maskName(handlingAction.operator) : handlingAction?.operator;
  const maskedDriver = isMasked && selectedWaybill ? maskName(selectedWaybill.driverName) : selectedWaybill?.driverName;
  const maskedPhone = isMasked && selectedWaybill ? maskPhone(selectedWaybill.driverPhone) : selectedWaybill?.driverPhone;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-40 animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 animate-slide-in overflow-y-auto scrollbar-thin">
        <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
              超温详情
            </h3>
            <p className="text-sm text-neutral-500 mt-0.5">报警编号: {alert.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-danger-50 rounded-xl p-4">
              <p className="text-xs text-danger-600 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                开始时间
              </p>
              <p className="text-sm font-medium text-neutral-800">
                {formatDateTime(alert.startTime)}
              </p>
            </div>
            <div className="bg-danger-50 rounded-xl p-4">
              <p className="text-xs text-danger-600 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                结束时间
              </p>
              <p className="text-sm font-medium text-neutral-800">
                {formatDateTime(alert.endTime)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-danger-50 to-white rounded-xl p-4 border border-danger-100">
              <p className="text-xs text-neutral-500 mb-1">持续时长</p>
              <p className="text-2xl font-bold text-danger-600">
                {formatDuration(alert.durationMinutes)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-warning-50 to-white rounded-xl p-4 border border-warning-100">
              <p className="text-xs text-neutral-500 mb-1">最高温度</p>
              <p className="text-2xl font-bold text-warning-600 flex items-center gap-1">
                <Thermometer className="w-5 h-5" />
                {formatTemperature(alert.maxTemperature)}
              </p>
            </div>
          </div>

          <div className="card p-4">
            <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              发生位置
            </h4>
            <p className="text-neutral-700">{alert.location}</p>
            <div className="mt-3 h-32 bg-gradient-to-br from-primary-50 to-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-neutral-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-primary-400" />
                <p className="text-xs">地图位置示意</p>
              </div>
            </div>
          </div>

          {selectedWaybill && !isMasked && (
            <div className="card p-4">
              <h4 className="text-sm font-semibold text-neutral-800 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary-500" />
                车辆信息
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">车牌号</span>
                  <span className="font-mono text-neutral-800">{selectedWaybill.vehicleNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">司机</span>
                  <span className="text-neutral-800">{maskedDriver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">联系电话</span>
                  <span className="font-mono text-neutral-800">{maskedPhone}</span>
                </div>
              </div>
            </div>
          )}

          {handlingAction && (
            <div className="card p-4 border-l-4 border-l-success-500">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-success-500" />
                <h4 className="text-sm font-semibold text-neutral-800">处理记录</h4>
                <span className="ml-auto badge-success">已处理</span>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-neutral-500 mb-1">处理时间</p>
                  <p className="text-neutral-800">{formatDateTime(handlingAction.timestamp)}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">操作人员</p>
                  <p className="text-neutral-800">{maskedOperator}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">处理动作</p>
                  <p className="text-neutral-800">{handlingAction.action}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">处理结果</p>
                  <p className="text-neutral-800">{handlingAction.result}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 mb-1">备注</p>
                  <p className="text-neutral-800 bg-neutral-50 p-3 rounded-lg">
                    {handlingAction.remark}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!handlingAction && (
            <div className="card p-4 border-l-4 border-l-warning-500">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning-500" />
                <p className="text-sm text-neutral-700">暂无处理记录</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
