import { Snowflake, CheckCircle, AlertTriangle, FileText, MapPin, Clock } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  formatDateTime,
  formatTemperature,
  formatDuration,
  formatTempRange,
  formatSignatureType,
  formatPercentage,
  formatDurationHours,
} from '@/utils/format';
import { maskName, maskLicensePlate } from '@/utils/mask';
import { generateTemperaturePath, getYForTemp } from '@/utils/temperature';

export const CertificatePreview = () => {
  const selectedWaybill = useAppStore((state) => state.selectedWaybill);
  const certificateSegments = useAppStore((state) => state.certificateSegments);
  const temperatureReadings = useAppStore((state) => state.temperatureReadings);
  const alertRecords = useAppStore((state) => state.alertRecords);
  const signatureNodes = useAppStore((state) => state.signatureNodes);
  const handlingActions = useAppStore((state) => state.handlingActions);

  const selectedSegments = certificateSegments.filter((s) => s.selected);
  const selectedAlertIds = selectedSegments
    .filter((s) => s.type === 'alert')
    .map((s) => {
      const alert = alertRecords.find(
        (a) => a.startTime === s.startTime && a.endTime === s.endTime
      );
      return alert?.id;
    })
    .filter(Boolean);

  const selectedSignatureIds = selectedSegments
    .filter((s) => s.type === 'signature')
    .map((s) => {
      const sig = signatureNodes.find((sig) => sig.timestamp === s.startTime);
      return sig?.id;
    })
    .filter(Boolean);

  if (!selectedWaybill) {
    return (
      <div className="card p-8 flex items-center justify-center">
        <p className="text-neutral-500">请先选择运单</p>
      </div>
    );
  }

  const includeFullTemp = selectedSegments.some((s) => s.type === 'temperature');
  const displayAlerts = alertRecords.filter((a) => selectedAlertIds.includes(a.id));
  const displaySignatures = signatureNodes.filter((s) =>
    selectedSignatureIds.includes(s.id)
  );

  const miniChartWidth = 700;
  const miniChartHeight = 120;

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          证明材料预览
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">
            已选择 {selectedSegments.length} 个片段
          </span>
        </div>
      </div>

      <div className="a4-paper bg-white">
        <div className="border-b border-neutral-300 pb-6 mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-neutral-800">冷链运输温度留痕摘要</h1>
              <p className="text-sm text-neutral-500">Cold Chain Transportation Temperature Report</p>
            </div>
          </div>
          <div className="text-center text-xs text-neutral-500">
            本报告由系统自动生成，所有数据真实有效
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-neutral-800 mb-3 pb-2 border-b border-neutral-200">
            一、运单基本信息
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">运单号</span>
              <span className="font-mono text-neutral-800">{selectedWaybill.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">客户名称</span>
              <span className="text-neutral-800">{selectedWaybill.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">运输线路</span>
              <span className="text-neutral-800">{selectedWaybill.route}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">货品类型</span>
              <span className="text-neutral-800">{selectedWaybill.goodsType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">要求温区</span>
              <span className="font-mono text-neutral-800">
                {formatTempRange(selectedWaybill.tempMin, selectedWaybill.tempMax)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">发货日期</span>
              <span className="text-neutral-800">{selectedWaybill.shipmentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">运输时长</span>
              <span className="text-neutral-800">
                {formatDurationHours(selectedWaybill.totalDuration)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">温度合规率</span>
              <span className={`font-medium ${
                selectedWaybill.complianceRate >= 98 ? 'text-success-600' :
                selectedWaybill.complianceRate >= 95 ? 'text-warning-600' : 'text-danger-600'
              }`}>
                {formatPercentage(selectedWaybill.complianceRate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">承运车辆</span>
              <span className="font-mono text-neutral-800">
                {maskLicensePlate(selectedWaybill.vehicleNo)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">司机</span>
              <span className="text-neutral-800">
                {maskName(selectedWaybill.driverName)}
              </span>
            </div>
          </div>
        </div>

        {includeFullTemp && temperatureReadings.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-3 pb-2 border-b border-neutral-200">
              二、全程温度曲线
            </h2>
            <div className="relative">
              <svg width="100%" viewBox={`0 0 ${miniChartWidth} ${miniChartHeight}`}>
                <defs>
                  <linearGradient id="miniTempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <line
                  x1={40}
                  y1={getYForTemp(selectedWaybill.tempMax, temperatureReadings, miniChartHeight, selectedWaybill.tempMin, selectedWaybill.tempMax)}
                  x2={miniChartWidth - 20}
                  y2={getYForTemp(selectedWaybill.tempMax, temperatureReadings, miniChartHeight, selectedWaybill.tempMin, selectedWaybill.tempMax)}
                  stroke="#0EA5E9"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />
                <line
                  x1={40}
                  y1={getYForTemp(selectedWaybill.tempMin, temperatureReadings, miniChartHeight, selectedWaybill.tempMin, selectedWaybill.tempMax)}
                  x2={miniChartWidth - 20}
                  y2={getYForTemp(selectedWaybill.tempMin, temperatureReadings, miniChartHeight, selectedWaybill.tempMin, selectedWaybill.tempMax)}
                  stroke="#0EA5E9"
                  strokeWidth={1}
                  strokeDasharray="3,3"
                />

                <path
                  d={generateTemperaturePath(temperatureReadings, miniChartWidth, miniChartHeight, selectedWaybill.tempMin, selectedWaybill.tempMax)}
                  fill="none"
                  stroke="#0EA5E9"
                  strokeWidth={1.5}
                />

                <text
                  x={35}
                  y={getYForTemp(selectedWaybill.tempMax, temperatureReadings, miniChartHeight, selectedWaybill.tempMin, selectedWaybill.tempMax) + 4}
                  textAnchor="end"
                  className="text-[8px] fill-neutral-500 font-mono"
                >
                  {selectedWaybill.tempMax}°C
                </text>
                <text
                  x={35}
                  y={getYForTemp(selectedWaybill.tempMin, temperatureReadings, miniChartHeight, selectedWaybill.tempMin, selectedWaybill.tempMax) + 4}
                  textAnchor="end"
                  className="text-[8px] fill-neutral-500 font-mono"
                >
                  {selectedWaybill.tempMin}°C
                </text>
              </svg>
              <div className="flex justify-between text-[10px] text-neutral-500 px-10 mt-1">
                <span>{formatDateTime(temperatureReadings[0].timestamp)}</span>
                <span>{formatDateTime(temperatureReadings[temperatureReadings.length - 1].timestamp)}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-neutral-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-px bg-primary-500"></span>
                实际温度
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-px bg-primary-500 border-dashed"></span>
                温区上下限
              </span>
            </div>
          </div>
        )}

        {displayAlerts.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-3 pb-2 border-b border-neutral-200">
              三、温度异常记录及处置
            </h2>
            <div className="space-y-4">
              {displayAlerts.map((alert, index) => {
                const action = handlingActions.find((a) => a.alertRecordId === alert.id);
                return (
                  <div
                    key={alert.id}
                    className="bg-neutral-50 rounded-lg p-4 border border-neutral-200"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-danger-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-neutral-800">
                          异常 #{index + 1}
                        </p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(alert.startTime)} → {formatDateTime(alert.endTime)}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                      <div className="bg-white p-2 rounded">
                        <p className="text-neutral-500">持续时长</p>
                        <p className="font-medium text-neutral-800">
                          {formatDuration(alert.durationMinutes)}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-neutral-500">最高温度</p>
                        <p className="font-medium text-danger-600">
                          {formatTemperature(alert.maxTemperature)}
                        </p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-neutral-500">发生位置</p>
                        <p className="font-medium text-neutral-800">{alert.location}</p>
                      </div>
                    </div>
                    {action && (
                      <div className="mt-3 pt-3 border-t border-neutral-200">
                        <p className="text-xs font-medium text-neutral-700 flex items-center gap-1 mb-2">
                          <CheckCircle className="w-3 h-3 text-success-500" />
                          处理措施
                        </p>
                        <div className="bg-white p-3 rounded text-xs space-y-1.5">
                          <div className="flex gap-2">
                            <span className="text-neutral-500 w-16 flex-shrink-0">处理人员</span>
                            <span className="text-neutral-800">{maskName(action.operator)}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-neutral-500 w-16 flex-shrink-0">处置动作</span>
                            <span className="text-neutral-800">{action.action}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-neutral-500 w-16 flex-shrink-0">处置结果</span>
                            <span className="text-neutral-800">{action.result}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-neutral-500 w-16 flex-shrink-0">备注</span>
                            <span className="text-neutral-800">{action.remark}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {displaySignatures.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-neutral-800 mb-3 pb-2 border-b border-neutral-200">
              四、签收节点
            </h2>
            <div className="relative pl-6">
              <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-primary-200" />
              {displaySignatures.map((sig) => (
                <div key={sig.id} className="relative pb-4 last:pb-0">
                  <div className="absolute -left-4 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    <CheckCircle className="w-2.5 h-2.5" />
                  </div>
                  <div className="bg-primary-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-primary-700">
                        {formatSignatureType(sig.type)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatDateTime(sig.timestamp)}
                      </span>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-1 text-neutral-600">
                        <MapPin className="w-3 h-3" />
                        {sig.location}
                      </div>
                      <div className="text-neutral-600">
                        签收人: {maskName(sig.operator)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-neutral-300">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <div className="flex items-center gap-4">
              <span>生成时间: {formatDateTime(new Date().toISOString())}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 bg-neutral-100 rounded flex items-center justify-center">
                <span className="text-[10px] text-neutral-400">公章</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
