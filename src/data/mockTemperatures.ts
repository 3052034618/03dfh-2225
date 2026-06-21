import type { TemperatureReading } from '@/types';

const generateTemperatureReadings = (
  waybillId: string,
  startTime: string,
  durationHours: number,
  minTemp: number,
  maxTemp: number,
  anomalies: Array<{ startHour: number; durationHours: number; maxTemp: number }> = []
): TemperatureReading[] => {
  const readings: TemperatureReading[] = [];
  const totalMinutes = durationHours * 60;
  const intervalMinutes = 5;
  const startDate = new Date(startTime);

  const locations = [
    { lat: 31.2304, lng: 121.4737, name: '上海市内' },
    { lat: 31.8, lng: 120.5, name: 'G2京沪高速' },
    { lat: 32.5, lng: 119.5, name: '江苏段' },
    { lat: 33.8, lng: 117.5, name: '山东段' },
    { lat: 36.6769, lng: 116.9863, name: '济南服务区' },
    { lat: 37.5, lng: 116.0, name: '山东河北交界' },
    { lat: 38.5, lng: 115.5, name: '河北段' },
    { lat: 39.9042, lng: 116.4074, name: '北京市内' },
  ];

  for (let i = 0; i <= totalMinutes; i += intervalMinutes) {
    const currentHour = i / 60;
    const currentDate = new Date(startDate.getTime() + i * 60 * 1000);

    let baseTemp = (minTemp + maxTemp) / 2;
    const variation = (Math.sin(i / 30) + Math.sin(i / 15) * 0.5) * 0.8;

    for (const anomaly of anomalies) {
      if (currentHour >= anomaly.startHour && currentHour < anomaly.startHour + anomaly.durationHours) {
        const progress = (currentHour - anomaly.startHour) / anomaly.durationHours;
        const anomalyVariation = Math.sin(progress * Math.PI) * (anomaly.maxTemp - baseTemp);
        baseTemp += anomalyVariation;
      }
    }

    const locationIndex = Math.min(
      Math.floor((currentHour / durationHours) * locations.length),
      locations.length - 1
    );
    const location = locations[locationIndex];

    readings.push({
      id: `temp-${waybillId}-${i}`,
      waybillId,
      timestamp: currentDate.toISOString(),
      temperature: Math.round((baseTemp + variation) * 10) / 10,
      latitude: location.lat + (Math.random() - 0.5) * 0.1,
      longitude: location.lng + (Math.random() - 0.5) * 0.1,
      location: location.name,
    });
  }

  return readings;
};

export const mockTemperatureData: Record<string, TemperatureReading[]> = {
  'CC202606200001': generateTemperatureReadings(
    'CC202606200001',
    '2026-06-20T08:00:00',
    18.5,
    -18,
    -12,
    [
      { startHour: 6, durationHours: 0.8, maxTemp: -10.5 },
      { startHour: 12, durationHours: 0.5, maxTemp: -9.8 },
    ]
  ),
  'CC202606200002': generateTemperatureReadings(
    'CC202606200002',
    '2026-06-20T14:00:00',
    6.2,
    2,
    8
  ),
  'CC202606190003': generateTemperatureReadings(
    'CC202606190003',
    '2026-06-19T09:00:00',
    4.8,
    0,
    6,
    [
      { startHour: 2.5, durationHours: 0.6, maxTemp: 8.2 },
    ]
  ),
  'CC202606190004': generateTemperatureReadings(
    'CC202606190004',
    '2026-06-19T06:00:00',
    22.3,
    -25,
    -18,
    [
      { startHour: 4, durationHours: 1.2, maxTemp: -15.3 },
      { startHour: 9, durationHours: 0.8, maxTemp: -14.8 },
      { startHour: 14, durationHours: 1.5, maxTemp: -12.5 },
      { startHour: 18, durationHours: 0.6, maxTemp: -15.7 },
      { startHour: 20, durationHours: 0.4, maxTemp: -16.2 },
    ]
  ),
  'CC202606180005': generateTemperatureReadings(
    'CC202606180005',
    '2026-06-18T07:00:00',
    12.6,
    2,
    8
  ),
  'CC202606180006': generateTemperatureReadings(
    'CC202606180006',
    '2026-06-18T10:00:00',
    8.4,
    -1,
    4,
    [
      { startHour: 5, durationHours: 0.3, maxTemp: 5.1 },
    ]
  ),
  'CC202606170007': generateTemperatureReadings(
    'CC202606170007',
    '2026-06-17T05:00:00',
    28.5,
    2,
    6,
    [
      { startHour: 8, durationHours: 0.7, maxTemp: 7.8 },
      { startHour: 16, durationHours: 0.5, maxTemp: 7.2 },
      { startHour: 24, durationHours: 0.6, maxTemp: 8.1 },
    ]
  ),
  'CC202606170008': generateTemperatureReadings(
    'CC202606170008',
    '2026-06-17T11:00:00',
    5.8,
    0,
    4
  ),
};

export const getTemperaturesByWaybillId = (
  waybillId: string
): TemperatureReading[] => {
  return mockTemperatureData[waybillId] || [];
};
