import type { AlertRecord } from '@/types';
import { getTemperaturesByWaybillId } from './mockTemperatures';
import { getAlertRecordsFromReadings } from '@/utils/temperature';

export const getAlertRecordsByWaybillId = (waybillId: string): AlertRecord[] => {
  const readings = getTemperaturesByWaybillId(waybillId);
  if (readings.length === 0) return [];
  const waybillTempMax = waybillTempMap[waybillId];
  if (waybillTempMax === undefined) return [];
  return getAlertRecordsFromReadings(readings, waybillTempMax);
};

const waybillTempMap: Record<string, number> = {
  'CC202606200001': -12,
  'CC202606200002': 8,
  'CC202606190003': 6,
  'CC202606190004': -18,
  'CC202606180005': 8,
  'CC202606180006': 4,
  'CC202606170007': 6,
  'CC202606170008': 4,
};
