import type { TemperatureReading, AlertRecord } from '@/types';

export const isTemperatureInRange = (
  temp: number,
  min: number,
  max: number
): boolean => {
  return temp >= min && temp <= max;
};

export const getTemperatureStatus = (
  temp: number,
  min: number,
  max: number
): 'normal' | 'high' | 'low' => {
  if (temp > max) return 'high';
  if (temp < min) return 'low';
  return 'normal';
};

export const calculateComplianceRate = (
  readings: TemperatureReading[],
  min: number,
  max: number
): number => {
  if (readings.length === 0) return 100;
  const compliantCount = readings.filter((r) =>
    isTemperatureInRange(r.temperature, min, max)
  ).length;
  return (compliantCount / readings.length) * 100;
};

export const findOverTemperatureIntervals = (
  readings: TemperatureReading[],
  max: number
): Array<{ start: TemperatureReading; end: TemperatureReading; maxTemp: number }> => {
  const intervals: Array<{ start: TemperatureReading; end: TemperatureReading; maxTemp: number }> = [];
  let currentInterval: { start: TemperatureReading; end: TemperatureReading; maxTemp: number } | null = null;

  readings.forEach((reading) => {
    if (reading.temperature > max) {
      if (!currentInterval) {
        currentInterval = {
          start: reading,
          end: reading,
          maxTemp: reading.temperature,
        };
      } else {
        currentInterval.end = reading;
        currentInterval.maxTemp = Math.max(currentInterval.maxTemp, reading.temperature);
      }
    } else if (currentInterval) {
      intervals.push(currentInterval);
      currentInterval = null;
    }
  });

  if (currentInterval) {
    intervals.push(currentInterval);
  }

  return intervals;
};

export const getAlertRecordsFromReadings = (
  readings: TemperatureReading[],
  max: number
): AlertRecord[] => {
  const intervals = findOverTemperatureIntervals(readings, max);
  return intervals.map((interval, index) => {
    const durationMs =
      new Date(interval.end.timestamp).getTime() -
      new Date(interval.start.timestamp).getTime();
    const durationMinutes = Math.round(durationMs / 1000 / 60);

    return {
      id: `alert-${index + 1}`,
      waybillId: readings[0]?.waybillId || '',
      startTime: interval.start.timestamp,
      endTime: interval.end.timestamp,
      durationMinutes,
      maxTemperature: interval.maxTemp,
      location: interval.start.location,
      handlingActionId: `action-${index + 1}`,
      isResolved: true,
    };
  });
};

export const generateTemperaturePath = (
  readings: TemperatureReading[],
  width: number,
  height: number,
  minTemp: number,
  maxTemp: number
): string => {
  if (readings.length === 0) return '';

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const tempMin = Math.min(...readings.map((r) => r.temperature), minTemp) - 2;
  const tempMax = Math.max(...readings.map((r) => r.temperature), maxTemp) + 2;
  const tempRange = tempMax - tempMin;

  const points = readings.map((reading, index) => {
    const x = padding + (index / (readings.length - 1)) * chartWidth;
    const y =
      padding +
      chartHeight -
      ((reading.temperature - tempMin) / tempRange) * chartHeight;
    return { x, y };
  });

  if (points.length < 2) return '';

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx1 = prev.x + (curr.x - prev.x) / 3;
    const cpy1 = prev.y;
    const cpx2 = prev.x + ((curr.x - prev.x) * 2) / 3;
    const cpy2 = curr.y;
    path += ` C ${cpx1.toFixed(2)} ${cpy1.toFixed(2)}, ${cpx2.toFixed(2)} ${cpy2.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
  }

  return path;
};

export const getYForTemp = (
  temp: number,
  readings: TemperatureReading[],
  height: number,
  minTemp: number,
  maxTemp: number
): number => {
  const padding = 40;
  const chartHeight = height - padding * 2;

  const tempMin = Math.min(...readings.map((r) => r.temperature), minTemp) - 2;
  const tempMax = Math.max(...readings.map((r) => r.temperature), maxTemp) + 2;
  const tempRange = tempMax - tempMin;

  return padding + chartHeight - ((temp - tempMin) / tempRange) * chartHeight;
};

export const getXForIndex = (
  index: number,
  total: number,
  width: number
): number => {
  const padding = 40;
  const chartWidth = width - padding * 2;
  return padding + (index / (total - 1)) * chartWidth;
};

export const findNearestReading = (
  x: number,
  readings: TemperatureReading[],
  width: number
): TemperatureReading | null => {
  if (readings.length === 0) return null;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const index = Math.round(((x - padding) / chartWidth) * (readings.length - 1));
  const clampedIndex = Math.max(0, Math.min(readings.length - 1, index));
  return readings[clampedIndex];
};
