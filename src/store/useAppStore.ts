import { create } from 'zustand';
import type { AppState, Waybill, CertificateSegment } from '@/types';
import { mockWaybills } from '@/data/mockWaybills';
import { getTemperaturesByWaybillId } from '@/data/mockTemperatures';
import { getEventsByWaybillId, getHandlingActionsByWaybillId, getSignatureNodesByWaybillId } from '@/data/mockEvents';
import { getAlertRecordsByWaybillId } from '@/data/mockAlerts';
import { formatDateTime } from '@/utils/format';
import { generateCustomerSummary } from '@/utils/summary';

const generateCertificateSegments = (waybillId: string): CertificateSegment[] => {
  const events = getEventsByWaybillId(waybillId);
  const alerts = getAlertRecordsByWaybillId(waybillId);
  const signatures = getSignatureNodesByWaybillId(waybillId);

  const segments: CertificateSegment[] = [];

  if (events.length > 0) {
    segments.push({
      id: 'seg-full',
      startTime: events[0].timestamp,
      endTime: events[events.length - 1].timestamp,
      type: 'temperature',
      selected: true,
      title: '全程温度记录',
    });
  }

  alerts.forEach((alert, index) => {
    segments.push({
      id: `seg-alert-${index + 1}`,
      startTime: alert.startTime,
      endTime: alert.endTime,
      type: 'alert',
      selected: true,
      title: `超温报警 #${index + 1} - ${formatDateTime(alert.startTime)}`,
    });
  });

  signatures.forEach((sig, index) => {
    const typeMap = { departure: '发货', transit: '中转', delivery: '签收' };
    segments.push({
      id: `seg-sig-${index + 1}`,
      startTime: sig.timestamp,
      endTime: sig.timestamp,
      type: 'signature',
      selected: true,
      title: `${typeMap[sig.type]}节点 - ${sig.location}`,
    });
  });

  const doorEvents = events.filter(e => e.type.startsWith('door'));
  for (let i = 0; i < doorEvents.length; i += 2) {
    if (doorEvents[i] && doorEvents[i + 1]) {
      segments.push({
        id: `seg-door-${Math.floor(i / 2) + 1}`,
        startTime: doorEvents[i].timestamp,
        endTime: doorEvents[i + 1].timestamp,
        type: 'door',
        selected: false,
        title: `开关门记录 #${Math.floor(i / 2) + 1}`,
      });
    }
  }

  return segments;
};

export const useAppStore = create<AppState>((set, get) => ({
  waybills: mockWaybills,
  selectedWaybill: null,
  temperatureReadings: [],
  timelineEvents: [],
  alertRecords: [],
  handlingActions: [],
  signatureNodes: [],
  selectedAlertId: null,
  selectedTimelineEventId: null,
  certificateSegments: [],
  customerSummary: null,
  searchFilters: {
    waybillId: '',
    customerName: '',
    shipmentDate: '',
    riskLevel: 'all',
  },

  setSelectedWaybill: (waybill: Waybill | null) => {
    set({ selectedWaybill: waybill });
    if (waybill) {
      get().loadWaybillData(waybill.id);
    }
  },

  setSelectedAlertId: (id: string | null) => {
    set({ selectedAlertId: id });
  },

  setSelectedTimelineEventId: (id: string | null) => {
    set({ selectedTimelineEventId: id });
  },

  generateCustomerSummary: () => {
    const { selectedWaybill, alertRecords, handlingActions } = get();
    if (!selectedWaybill) return;
    const summary = generateCustomerSummary(selectedWaybill, alertRecords, handlingActions);
    set({ customerSummary: summary });
  },

  setSearchFilters: (filters) => {
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters },
    }));
  },

  toggleSegment: (id: string) => {
    set((state) => ({
      certificateSegments: state.certificateSegments.map((seg) =>
        seg.id === id ? { ...seg, selected: !seg.selected } : seg
      ),
    }));
  },

  selectAllSegments: () => {
    set((state) => ({
      certificateSegments: state.certificateSegments.map((seg) => ({
        ...seg,
        selected: true,
      })),
    }));
  },

  clearSegments: () => {
    set((state) => ({
      certificateSegments: state.certificateSegments.map((seg) => ({
        ...seg,
        selected: false,
      })),
    }));
  },

  resetSearchFilters: () => {
    set({
      searchFilters: {
        waybillId: '',
        customerName: '',
        shipmentDate: '',
        riskLevel: 'all',
      },
    });
  },

  loadWaybillData: (waybillId: string) => {
    const temperatures = getTemperaturesByWaybillId(waybillId);
    const events = getEventsByWaybillId(waybillId);
    const alerts = getAlertRecordsByWaybillId(waybillId);
    const actions = getHandlingActionsByWaybillId(waybillId);
    const signatures = getSignatureNodesByWaybillId(waybillId);
    const segments = generateCertificateSegments(waybillId);
    const waybill = get().waybills.find((w) => w.id === waybillId);
    const summary = waybill ? generateCustomerSummary(waybill, alerts, actions) : null;

    set({
      temperatureReadings: temperatures,
      timelineEvents: events,
      alertRecords: alerts,
      handlingActions: actions,
      signatureNodes: signatures,
      certificateSegments: segments,
      selectedAlertId: null,
      selectedTimelineEventId: null,
      customerSummary: summary,
    });
  },

  getFilteredWaybills: () => {
    const { waybills, searchFilters } = get();
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
  },

  getAlertById: (id: string) => {
    return get().alertRecords.find((a) => a.id === id);
  },

  getHandlingActionByAlertId: (alertId: string) => {
    return get().handlingActions.find((a) => a.alertRecordId === alertId);
  },

  getSignatureNodesByWaybillId: (waybillId: string) => {
    return get().signatureNodes.filter((s) => s.waybillId === waybillId);
  },
}));
