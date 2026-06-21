import { useState, useMemo } from 'react';
import {
  MapPin,
  Thermometer,
  Clock,
  AlertTriangle,
  DoorOpen,
  DoorClosed,
  MessageSquare,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  User,
  ShieldAlert,
  Info,
} from 'lucide-react';
import type {
  TemperatureReading,
  AlertRecord,
  TimelineEvent,
  HandlingAction,
} from '@/types';
import {
  generateTemperaturePath,
  getYForTemp,
  getXForIndex,
  findNearestReading,
} from '@/utils/temperature';
import {
  formatDateTime,
  formatTemperature,
  formatDuration,
  getEventColor,
  formatEventTitle,
  formatSignatureType,
} from '@/utils/format';
import { maskPhone, maskName } from '@/utils/mask';

interface UnifiedTimelineProps {
  readings: TemperatureReading[];
  minTemp: number;
  maxTemp: number;
  alerts: AlertRecord[];
  events: TimelineEvent[];
  handlingActions: HandlingAction[];
  driverName?: string;
  driverPhone?: string;
  vehicleNo?: string;
}

interface EventMarker {
  x: number;
  event: TimelineEvent;
  type: string;
  color: string;
}

export const UnifiedTimeline = ({
  readings,
  minTemp,
  maxTemp,
  alerts,
  events,
  handlingActions,
  driverName,
  driverPhone,
  vehicleNo,
}: UnifiedTimelineProps) => {
  const [hoveredReading, setHoveredReading] = useState<TemperatureReading | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const width = 900;
  const height = 300;
  const padding = 60;

  const path = useMemo(
    () => generateTemperaturePath(readings, width, height, minTemp, maxTemp),
    [readings, minTemp, maxTemp]
  );

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
    [events]
  );

  const eventMarkers = useMemo((): EventMarker[] => {
    if (readings.length === 0) return [];
    const firstTime = new Date(readings[0].timestamp).getTime();
    const lastTime = new Date(readings[readings.length - 1].timestamp).getTime();
    const totalRange = lastTime - firstTime;

    return sortedEvents.map((event) => {
      const eventTime = new Date(event.timestamp).getTime();
      const x = padding + ((eventTime - firstTime) / totalRange) * (width - padding * 2);
      return {
        x: Math.max(padding, Math.min(width - padding, x)),
        event,
        type: event.type,
        color: getEventColor(event.type),
      };
    });
  }, [sortedEvents, readings]);

  const getAlertXRange = (alert: AlertRecord) => {
    const startTime = new Date(alert.startTime).getTime();
    const endTime = new Date(alert.endTime).getTime();
    const firstTime = new Date(readings[0].timestamp).getTime();
    const lastTime = new Date(readings[readings.length - 1].timestamp).getTime();
    const totalRange = lastTime - firstTime;

    const startX = padding + ((startTime - firstTime) / totalRange) * (width - padding * 2);
    const endX = padding + ((endTime - firstTime) / totalRange) * (width - padding * 2);

    return { startX, endX };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const reading = findNearestReading(x, readings, width);
    setHoveredReading(reading);
  };

  const handleMouseLeave = () => {
    setHoveredReading(null);
  };

  const handleAlertClick = (alertId: string) => {
    setSelectedAlertId(selectedAlertId === alertId ? null : alertId);
    setSelectedEventId(null);
  };

  const handleEventClick = (eventId: string) => {
    setSelectedEventId(selectedEventId === eventId ? null : eventId);
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
    setSelectedAlertId(null);
  };

  const toggleEventExpand = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-3 h-3" />;
      case 'door_open':
        return <DoorOpen className="w-3 h-3" />;
      case 'door_close':
        return <DoorClosed className="w-3 h-3" />;
      case 'remark':
        return <MessageSquare className="w-3 h-3" />;
      case 'signature':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getHandlingActionForAlert = (alertId: string) => {
    return handlingActions.find((a) => a.alertRecordId === alertId);
  };

  const getAlertForEvent = (event: TimelineEvent) => {
    if (event.type !== 'alert') return null;
    return alerts.find(
      (a) =>
        Math.abs(new Date(a.startTime).getTime() - new Date(event.timestamp).getTime()) < 60000
    );
  };

  const yAxisTicks = useMemo(() => {
    const tempMin = Math.min(...readings.map((r) => r.temperature), minTemp) - 2;
    const tempMax = Math.max(...readings.map((r) => r.temperature), maxTemp) + 2;
    return Array.from({ length: 5 }, (_, i) => tempMin + (i / 4) * (tempMax - tempMin));
  }, [readings, minTemp, maxTemp]);

  const xAxisLabels = useMemo(
    () => readings.filter((_, i) => i % Math.floor(readings.length / 6) === 0),
    [readings]
  );

  if (readings.length === 0) {
    return (
      <div className="card p-8 flex items-center justify-center">
        <p className="text-neutral-500">暂无温度数据</p>
      </div>
    );
  }

  const selectedAlert = selectedAlertId ? alerts.find((a) => a.id === selectedAlertId) : null;
  const selectedAlertAction = selectedAlertId ? getHandlingActionForAlert(selectedAlertId) : null;
  const selectedEvent = selectedEventId
    ? sortedEvents.find((e) => e.id === selectedEventId)
    : null;
  const selectedEventAlert = selectedEvent ? getAlertForEvent(selectedEvent) : null;
  const selectedEventAction = selectedEventAlert
    ? getHandlingActionForAlert(selectedEventAlert.id)
    : null;

  const sidebarAlert = selectedAlert || selectedEventAlert;
  const sidebarAction = selectedAlertAction || selectedEventAction;
  const hasSelection = !!selectedAlert || !!selectedEvent;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
      <div className="xl:col-span-3 card p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-primary-500" />
          温度留痕时间轴
          <span className="ml-auto text-sm font-normal text-neutral-500">
            温区要求: {formatTemperature(minTemp)} ~ {formatTemperature(maxTemp)}
          </span>
        </h3>

        <div className="relative">
          <svg
            width="100%"
            viewBox={`0 0 ${width} ${height + 60}`}
            className="w-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <defs>
              <linearGradient id="unifiedTempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="unifiedAlertGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {yAxisTicks.map((temp, i) => {
              const y = getYForTemp(temp, readings, height, minTemp, maxTemp);
              const isMin = temp === minTemp;
              const isMax = temp === maxTemp;
              return (
                <g key={i}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke={isMin || isMax ? '#0EA5E9' : '#E2E8F0'}
                    strokeWidth={isMin || isMax ? 2 : 1}
                    strokeDasharray={isMin || isMax ? '6,4' : '3,3'}
                  />
                  <text
                    x={padding - 10}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-neutral-500 font-mono"
                  >
                    {formatTemperature(temp)}
                  </text>
                </g>
              );
            })}

            {alerts.map((alert) => {
              const { startX, endX } = getAlertXRange(alert);
              const isSelected = selectedAlertId === alert.id;
              return (
                <g
                  key={alert.id}
                  onClick={() => handleAlertClick(alert.id)}
                  className="cursor-pointer"
                >
                  <rect
                    x={startX}
                    y={padding}
                    width={endX - startX}
                    height={height - padding * 2}
                    fill="url(#unifiedAlertGradient)"
                    rx={4}
                    stroke={isSelected ? '#EF4444' : 'transparent'}
                    strokeWidth={2}
                    className="transition-all hover:opacity-80"
                  />
                  <text
                    x={(startX + endX) / 2}
                    y={padding - 8}
                    textAnchor="middle"
                    className="text-xs fill-danger-600 font-medium"
                  >
                    超温 {formatDuration(alert.durationMinutes)}
                  </text>
                </g>
              );
            })}

            <path
              d={`${path} L ${getXForIndex(readings.length - 1, readings.length, width)} ${height - padding} L ${padding} ${height - padding} Z`}
              fill="url(#unifiedTempGradient)"
            />

            <path
              d={path}
              fill="none"
              stroke="#0EA5E9"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {eventMarkers.map((marker) => {
              const isSelected = selectedEventId === marker.event.id;
              return (
                <g
                  key={marker.event.id}
                  onClick={() => handleEventClick(marker.event.id)}
                  className="cursor-pointer"
                >
                  <line
                    x1={marker.x}
                    y1={padding - 30}
                    x2={marker.x}
                    y2={height - padding + 30}
                    stroke={marker.color}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeDasharray={isSelected ? 'none' : '4,4'}
                    opacity={isSelected ? 1 : 0.5}
                  />
                  <circle
                    cx={marker.x}
                    cy={height - padding + 30}
                    r={isSelected ? 10 : 8}
                    fill="white"
                    stroke={marker.color}
                    strokeWidth={2}
                  />
                  <text
                    x={marker.x}
                    y={height - padding + 31}
                    textAnchor="middle"
                    fill={marker.color}
                    className="pointer-events-none"
                  >
                    {getEventIcon(marker.type)}
                  </text>
                </g>
              );
            })}

            {hoveredReading && (
              <>
                <line
                  x1={getXForIndex(
                    readings.findIndex((r) => r.id === hoveredReading.id),
                    readings.length,
                    width
                  )}
                  y1={padding}
                  x2={getXForIndex(
                    readings.findIndex((r) => r.id === hoveredReading.id),
                    readings.length,
                    width
                  )}
                  y2={height - padding}
                  stroke="#0EA5E9"
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
                <circle
                  cx={getXForIndex(
                    readings.findIndex((r) => r.id === hoveredReading.id),
                    readings.length,
                    width
                  )}
                  cy={getYForTemp(hoveredReading.temperature, readings, height, minTemp, maxTemp)}
                  r={6}
                  fill="white"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                />
              </>
            )}

            {xAxisLabels.map((reading, i) => {
              const index = readings.findIndex((r) => r.id === reading.id);
              return (
                <text
                  key={i}
                  x={getXForIndex(index, readings.length, width)}
                  y={height + 20}
                  textAnchor="middle"
                  className="text-xs fill-neutral-500"
                >
                  {formatDateTime(reading.timestamp).split(' ')[1]}
                </text>
              );
            })}
          </svg>

          {hoveredReading && (
            <div
              className="absolute z-10 bg-white rounded-lg shadow-lg border border-neutral-200 p-3 pointer-events-none animate-fade-in"
              style={{
                left: `${Math.min(mousePos.x + 15, width - 200)}px`,
                top: `${Math.max(mousePos.y - 80, 10)}px`,
              }}
            >
              <p className="text-xs text-neutral-500 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDateTime(hoveredReading.timestamp)}
              </p>
              <p className="text-lg font-bold text-neutral-800 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-primary-500" />
                {formatTemperature(hoveredReading.temperature)}
              </p>
              <p className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {hoveredReading.location}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-200 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-500"></span>
            <span className="text-sm text-neutral-600">实际温度</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-0.5 bg-primary-500 border-dashed"></span>
            <span className="text-sm text-neutral-600">温区上下限</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-danger-500/30"></span>
            <span className="text-sm text-neutral-600">超温区间</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-danger-500 flex items-center justify-center">
              <AlertTriangle className="w-2 h-2 text-white" />
            </span>
            <span className="text-sm text-neutral-600">报警</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning-500 flex items-center justify-center">
              <DoorOpen className="w-2 h-2 text-white" />
            </span>
            <span className="text-sm text-neutral-600">开门</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success-500 flex items-center justify-center">
              <DoorClosed className="w-2 h-2 text-white" />
            </span>
            <span className="text-sm text-neutral-600">关门</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-neutral-500 flex items-center justify-center">
              <MessageSquare className="w-2 h-2 text-white" />
            </span>
            <span className="text-sm text-neutral-600">备注</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary-500 flex items-center justify-center">
              <CheckCircle className="w-2 h-2 text-white" />
            </span>
            <span className="text-sm text-neutral-600">签收</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            事件详情（点击查看）
          </h4>
          {sortedEvents.map((event) => {
            const isExpanded = expandedEventId === event.id;
            const isSelected = selectedEventId === event.id;
            const alert = getAlertForEvent(event);
            const action = alert ? getHandlingActionForAlert(alert.id) : null;

            return (
              <div
                key={event.id}
                onClick={() => handleEventClick(event.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-primary-300 bg-primary-50/50'
                    : 'border-neutral-200 hover:border-primary-200 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: getEventColor(event.type) }}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-neutral-800">{event.title}</span>
                      <span className="text-xs text-neutral-500 font-mono">
                        {formatDateTime(event.timestamp)}
                      </span>
                      {event.type === 'alert' && (
                        <span className="ml-auto flex items-center gap-1 text-xs text-danger-600">
                          <ShieldAlert className="w-3 h-3" />
                          有报警记录
                        </span>
                      )}
                      <button
                        onClick={(e) => toggleEventExpand(event.id, e)}
                        className="ml-auto p-1 rounded hover:bg-white/50"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-neutral-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-neutral-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-neutral-600">{event.description}</p>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4 animate-fade-in">
                        {alert && (
                          <div className="bg-danger-50 rounded-lg p-4 border border-danger-100">
                            <h5 className="text-sm font-semibold text-danger-700 mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              温度报警详情
                            </h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs text-neutral-500 mb-1">持续时长</p>
                                <p className="text-sm font-medium text-neutral-800">
                                  {formatDuration(alert.durationMinutes)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-neutral-500 mb-1">最高温度</p>
                                <p className="text-sm font-medium text-danger-600">
                                  {formatTemperature(alert.maxTemperature)}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs text-neutral-500 mb-1">发生位置</p>
                                <p className="text-sm font-medium text-neutral-800">
                                  {alert.location}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {action && (
                          <div className="bg-success-50 rounded-lg p-4 border border-success-100">
                            <h5 className="text-sm font-semibold text-success-700 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              处置记录
                            </h5>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-neutral-500 mb-1">处理时间</p>
                                <p className="text-sm font-medium text-neutral-800">
                                  {formatDateTime(action.timestamp)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-neutral-500 mb-1">操作人员</p>
                                <p className="text-sm font-medium text-neutral-800">
                                  {maskName(action.operator)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-neutral-500 mb-1">处置动作</p>
                                <p className="text-sm text-neutral-800">{action.action}</p>
                              </div>
                              <div>
                                <p className="text-xs text-neutral-500 mb-1">处理结果</p>
                                <p className="text-sm text-neutral-800">{action.result}</p>
                              </div>
                              <div>
                                <p className="text-xs text-neutral-500 mb-1">备注说明</p>
                                <p className="text-sm text-neutral-800 bg-white p-3 rounded-lg">
                                  {action.remark}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {event.type === 'signature' && (
                          <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                            <h5 className="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" />
                              签收信息
                            </h5>
                            <div className="text-sm text-neutral-700">
                              <p className="mb-2">
                                <span className="text-neutral-500">类型：</span>
                                {formatSignatureType(
                                  event.description.includes('发货')
                                    ? 'departure'
                                    : event.description.includes('中转')
                                    ? 'transit'
                                    : 'delivery'
                                )}
                              </p>
                              <p>
                                <span className="text-neutral-500">签收状态：</span>
                                <span className="text-success-600 font-medium">已完成</span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="xl:col-span-1">
        <div className="card p-5 sticky top-6">
          <h3 className="text-base font-semibold text-neutral-800 mb-4 flex items-center gap-2 pb-3 border-b border-neutral-200">
            <Info className="w-5 h-5 text-primary-500" />
            异常详情面板
          </h3>

          {!hasSelection ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                <Info className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-500 leading-relaxed">
                请点击左侧时间轴上的报警事件或超温区间，查看详细信息
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
              {sidebarAlert && (
                <div className="bg-danger-50/70 rounded-xl p-4 border border-danger-200">
                  <h4 className="text-sm font-semibold text-danger-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    温度异常
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-danger-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-500">持续时长</p>
                        <p className="text-sm font-medium text-neutral-800">
                          {formatDuration(sidebarAlert.durationMinutes)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Thermometer className="w-3.5 h-3.5 text-danger-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-500">最高温度</p>
                        <p className="text-sm font-semibold text-danger-600">
                          {formatTemperature(sidebarAlert.maxTemperature)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-danger-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-500">发生位置</p>
                        <p className="text-sm font-medium text-neutral-800">
                          {sidebarAlert.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-danger-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-500">开始时间</p>
                        <p className="text-sm font-medium text-neutral-800">
                          {formatDateTime(sidebarAlert.startTime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-danger-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-500">结束时间</p>
                        <p className="text-sm font-medium text-neutral-800">
                          {formatDateTime(sidebarAlert.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sidebarAction && (
                <div className="bg-success-50/70 rounded-xl p-4 border border-success-200">
                  <h4 className="text-sm font-semibold text-success-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    处置记录
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-success-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-500">处理时间</p>
                        <p className="text-sm font-medium text-neutral-800">
                          {formatDateTime(sidebarAction.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <User className="w-3.5 h-3.5 text-success-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-500">处理人员</p>
                        <p className="text-sm font-medium text-neutral-800">
                          {maskName(sidebarAction.operator)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-success-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-500">处置动作</p>
                        <p className="text-sm text-neutral-800">{sidebarAction.action}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-success-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-500">处理结果</p>
                        <p className="text-sm text-neutral-800">{sidebarAction.result}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-success-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-neutral-500">备注说明</p>
                        <p className="text-sm text-neutral-800 bg-white/60 p-2.5 rounded-lg">
                          {sidebarAction.remark}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-primary-50/70 rounded-xl p-4 border border-primary-200">
                <h4 className="text-sm font-semibold text-primary-700 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  客服话术
                </h4>
                <div className="bg-white rounded-lg p-3 border border-primary-100 text-sm text-neutral-700 space-y-2.5">
                  <p>
                    <span className="font-medium text-primary-600">您问的这个时间点：</span>
                    {selectedAlert
                      ? `${formatDateTime(selectedAlert.startTime)} 发生了一次温度异常`
                      : selectedEvent
                      ? `${formatDateTime(selectedEvent.timestamp)} 发生了${formatEventTitle(selectedEvent.type)}`
                      : ''}
                  </p>
                  <p>
                    <span className="font-medium text-primary-600">具体情况是：</span>
                    {sidebarAlert
                      ? `温度最高达到 ${formatTemperature(sidebarAlert.maxTemperature)}，持续了 ${formatDuration(sidebarAlert.durationMinutes)}，发生在 ${sidebarAlert.location}。`
                      : selectedEvent
                      ? selectedEvent.description
                      : ''}
                  </p>
                  {sidebarAction && (
                    <p>
                      <span className="font-medium text-success-600">我们当时的处理：</span>
                      {sidebarAction.action}，处理结果是 {sidebarAction.result.toLowerCase()}。
                    </p>
                  )}
                  {driverName && driverPhone && (
                    <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                      <User className="w-3 h-3 inline mr-1" />
                      司机：{maskName(driverName)}，联系电话：{maskPhone(driverPhone)}
                      {vehicleNo && `，车辆：${vehicleNo}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
