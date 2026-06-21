import { useState, useRef } from 'react';
import { MapPin, Thermometer, Clock } from 'lucide-react';
import type { TemperatureReading, AlertRecord } from '@/types';
import {
  generateTemperaturePath,
  getYForTemp,
  getXForIndex,
  findNearestReading,
} from '@/utils/temperature';
import { formatDateTime, formatTemperature, formatDuration } from '@/utils/format';
import { useAppStore } from '@/store/useAppStore';

interface TempChartProps {
  readings: TemperatureReading[];
  minTemp: number;
  maxTemp: number;
  alerts: AlertRecord[];
  width?: number;
  height?: number;
}

export const TempChart = ({
  readings,
  minTemp,
  maxTemp,
  alerts,
  width = 900,
  height = 300,
}: TempChartProps) => {
  const [hoveredReading, setHoveredReading] = useState<TemperatureReading | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const setSelectedAlertId = useAppStore((state) => state.setSelectedAlertId);
  const selectedAlertId = useAppStore((state) => state.selectedAlertId);

  const padding = 40;
  const path = generateTemperaturePath(readings, width, height, minTemp, maxTemp);

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
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
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
  };

  const yAxisTicks = Array.from({ length: 5 }, (_, i) => {
    const tempMin = Math.min(...readings.map((r) => r.temperature), minTemp) - 2;
    const tempMax = Math.max(...readings.map((r) => r.temperature), maxTemp) + 2;
    return tempMin + (i / 4) * (tempMax - tempMin);
  });

  const xAxisLabels = readings.filter((_, i) => i % Math.floor(readings.length / 6) === 0);

  if (readings.length === 0) {
    return (
      <div className="card p-8 flex items-center justify-center">
        <p className="text-neutral-500">暂无温度数据</p>
      </div>
    );
  }

  return (
    <div className="card p-6 relative">
      <h3 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
        <Thermometer className="w-5 h-5 text-primary-500" />
        温度曲线
        <span className="ml-auto text-sm font-normal text-neutral-500">
          温区要求: {formatTemperature(minTemp)} ~ {formatTemperature(maxTemp)}
        </span>
      </h3>

      <div className="relative">
        <svg
          ref={svgRef}
          width="100%"
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="alertGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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
              <g key={alert.id} onClick={() => handleAlertClick(alert.id)} className="cursor-pointer">
                <rect
                  x={startX}
                  y={padding}
                  width={endX - startX}
                  height={height - padding * 2}
                  fill="url(#alertGradient)"
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
            fill="url(#tempGradient)"
          />

          <path
            d={path}
            fill="none"
            stroke="#0EA5E9"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-draw-line"
            style={{ strokeDasharray: 1000 }}
          />

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
                y={height - 15}
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

      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-neutral-200">
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
          <span className="text-sm text-neutral-600">超温区间（点击查看详情）</span>
        </div>
      </div>
    </div>
  );
};
