import { create } from 'zustand';
import type {
  AppState,
  Waybill,
  CertificateSegment,
  DisputeTicket,
  CertificateVersion,
  VersionPurpose,
  AlertRecord,
} from '@/types';
import { mockWaybills } from '@/data/mockWaybills';
import { getTemperaturesByWaybillId } from '@/data/mockTemperatures';
import { getEventsByWaybillId, getHandlingActionsByWaybillId, getSignatureNodesByWaybillId } from '@/data/mockEvents';
import { getAlertRecordsByWaybillId } from '@/data/mockAlerts';
import {
  mockTickets,
  mockVersions,
  mockCustomerSummaries,
} from '@/data/mockTickets';
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
  disputeTickets: mockTickets,
  certificateVersions: mockVersions,
  customerSummaries: mockCustomerSummaries,
  selectedTicketId: null,
  selectedVersionId: null,
  searchFilters: {
    waybillId: '',
    customerName: '',
    shipmentDate: '',
    riskLevel: 'all',
    ticketStatus: 'all',
    viewMode: 'waybill',
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

  generateSegmentBasedSummary: () => {
    const { selectedWaybill, alertRecords, handlingActions, certificateSegments } = get();
    if (!selectedWaybill) return;

    const selectedSegmentIds = certificateSegments.filter((s) => s.selected).map((s) => s.id);

    const hasTemperatureSegment = selectedSegmentIds.includes('seg-full');
    const selectedAlertSegments = selectedSegmentIds.filter((id) => id.startsWith('seg-alert-'));

    let filteredAlerts: AlertRecord[] = [];
    if (hasTemperatureSegment) {
      filteredAlerts = alertRecords;
    } else {
      selectedAlertSegments.forEach((segId) => {
        const index = parseInt(segId.replace('seg-alert-', ''), 10) - 1;
        if (alertRecords[index]) {
          filteredAlerts.push(alertRecords[index]);
        }
      });
    }

    const baseWaybill = {
      ...selectedWaybill,
      alertCount: filteredAlerts.length,
      complianceRate: filteredAlerts.length === 0
        ? 100
        : hasTemperatureSegment
        ? selectedWaybill.complianceRate
        : Math.max(95, selectedWaybill.complianceRate + (alertRecords.length - filteredAlerts.length) * 1.5),
    };

    const summary = generateCustomerSummary(baseWaybill, filteredAlerts, handlingActions);

    if (!hasTemperatureSegment && filteredAlerts.length === 0) {
      summary.conclusion = `尊敬的${selectedWaybill.customerName}客户，您好！您关注的本次运输环节（${certificateSegments.filter(s => s.selected).map(s => s.title).join('、')}）经核查无温度异常，相关记录完整，货物品质有保障。`;
      summary.isFullyCompliant = true;
    } else if (filteredAlerts.length === 0) {
      summary.conclusion = `尊敬的${selectedWaybill.customerName}客户，您好！根据您选择的记录范围，未包含温度异常片段，所选${certificateSegments.filter(s => s.selected).length > 1 ? '各环节' : '环节'}温度均在要求范围内。`;
      summary.isFullyCompliant = true;
    }

    set({ customerSummary: summary });
  },

  setSearchFilters: (filters) => {
    set((state) => ({
      searchFilters: { ...state.searchFilters, ...filters },
    }));
  },

  toggleSegment: (id: string) => {
    set((state) => {
      const newSegments = state.certificateSegments.map((seg) =>
        seg.id === id ? { ...seg, selected: !seg.selected } : seg
      );
      return { certificateSegments: newSegments };
    });
    setTimeout(() => {
      get().generateSegmentBasedSummary();
    }, 0);
  },

  selectAllSegments: () => {
    set((state) => ({
      certificateSegments: state.certificateSegments.map((seg) => ({
        ...seg,
        selected: true,
      })),
    }));
    setTimeout(() => {
      get().generateCustomerSummary();
    }, 0);
  },

  clearSegments: () => {
    set((state) => ({
      certificateSegments: state.certificateSegments.map((seg) => ({
        ...seg,
        selected: false,
      })),
    }));
    setTimeout(() => {
      get().generateSegmentBasedSummary();
    }, 0);
  },

  resetSearchFilters: () => {
    set({
      searchFilters: {
        waybillId: '',
        customerName: '',
        shipmentDate: '',
        riskLevel: 'all',
        ticketStatus: 'all',
        viewMode: 'waybill',
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

  createDisputeTicket: (ticketData) => {
    const newTicket: DisputeTicket = {
      ...ticketData,
      id: `T${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      disputeTickets: [newTicket, ...state.disputeTickets],
    }));
  },

  updateDisputeTicket: (id: string, updates: Partial<DisputeTicket>) => {
    set((state) => ({
      disputeTickets: state.disputeTickets.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  getFilteredTickets: () => {
    const { disputeTickets, searchFilters } = get();
    return disputeTickets.filter((ticket) => {
      const matchesId = searchFilters.waybillId
        ? ticket.waybillId.toLowerCase().includes(searchFilters.waybillId.toLowerCase())
        : true;
      const matchesCustomer = searchFilters.customerName
        ? ticket.customerName.toLowerCase().includes(searchFilters.customerName.toLowerCase())
        : true;
      const matchesRisk = searchFilters.riskLevel && searchFilters.riskLevel !== 'all'
        ? ticket.riskLevel === searchFilters.riskLevel
        : true;
      const matchesStatus = searchFilters.ticketStatus && searchFilters.ticketStatus !== 'all'
        ? ticket.status === searchFilters.ticketStatus
        : true;
      return matchesId && matchesCustomer && matchesRisk && matchesStatus;
    });
  },

  saveCertificateVersion: (purpose: VersionPurpose, customNote?: string) => {
    const { selectedWaybill, certificateSegments, customerSummary, certificateVersions } = get();
    if (!selectedWaybill || !customerSummary) return;

    const waybillVersions = certificateVersions.filter((v) => v.waybillId === selectedWaybill.id);
    const nextVersionNumber = waybillVersions.length > 0
      ? Math.max(...waybillVersions.map((v) => v.versionNumber)) + 1
      : 1;

    const newVersion: CertificateVersion = {
      id: `V${Date.now()}`,
      waybillId: selectedWaybill.id,
      versionNumber: nextVersionNumber,
      createdAt: new Date().toISOString(),
      createdBy: '当前客服',
      purpose,
      customNote,
      selectedSegmentIds: certificateSegments.filter((s) => s.selected).map((s) => s.id),
      summarySnapshot: JSON.parse(JSON.stringify(customerSummary)),
    };

    set((state) => ({
      certificateVersions: [newVersion, ...state.certificateVersions],
    }));
  },

  getVersionsByWaybillId: (waybillId: string) => {
    return get().certificateVersions.filter((v) => v.waybillId === waybillId);
  },

  restoreCertificateVersion: (versionId: string) => {
    const { certificateVersions, certificateSegments } = get();
    const version = certificateVersions.find((v) => v.id === versionId);
    if (!version) return;

    const newSegments = certificateSegments.map((seg) => ({
      ...seg,
      selected: version.selectedSegmentIds.includes(seg.id),
    }));

    set({
      certificateSegments: newSegments,
      customerSummary: version.summarySnapshot,
    });
  },

  getCustomerExceptionSummary: (customerName: string) => {
    return get().customerSummaries.find((c) => c.customerName === customerName);
  },
}));
