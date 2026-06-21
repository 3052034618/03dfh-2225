export type WaybillStatus = 'in_transit' | 'delivered' | 'exception';
export type RiskLevel = 'compliant' | 'minor' | 'severe';
export type TicketStatus = 'pending' | 'in_progress' | 'resolved' | 'escalated';
export type TicketPriority = 'low' | 'medium' | 'high';
export type VersionPurpose = 'customer_query' | 'audit' | 'complaint' | 'insurance' | 'other';
export type TicketLogType = 'status_change' | 'remark' | 'material' | 'assignment' | 'creation' | 'escalation';

export interface Waybill {
  id: string;
  customerName: string;
  shipmentDate: string;
  origin: string;
  destination: string;
  route: string;
  goodsType: string;
  tempMin: number;
  tempMax: number;
  currentStatus: WaybillStatus;
  vehicleNo: string;
  driverName: string;
  driverPhone: string;
  totalDuration: number;
  complianceRate: number;
  alertCount: number;
  riskLevel: RiskLevel;
}

export interface TemperatureReading {
  id: string;
  waybillId: string;
  timestamp: string;
  temperature: number;
  latitude: number;
  longitude: number;
  location: string;
}

export type EventType = 'alert' | 'door_open' | 'door_close' | 'remark' | 'signature';
export type EventSeverity = 'info' | 'warning' | 'danger';

export interface TimelineEvent {
  id: string;
  waybillId: string;
  type: EventType;
  timestamp: string;
  title: string;
  description: string;
  severity: EventSeverity;
}

export interface AlertRecord {
  id: string;
  waybillId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  maxTemperature: number;
  location: string;
  handlingActionId: string;
  isResolved: boolean;
}

export interface HandlingAction {
  id: string;
  alertRecordId: string;
  timestamp: string;
  operator: string;
  action: string;
  result: string;
  remark: string;
}

export type SignatureType = 'departure' | 'transit' | 'delivery';

export interface SignatureNode {
  id: string;
  waybillId: string;
  type: SignatureType;
  timestamp: string;
  location: string;
  operator: string;
  signatureUrl: string;
}

export type SegmentType = 'temperature' | 'alert' | 'door' | 'signature';

export interface CertificateSegment {
  id: string;
  startTime: string;
  endTime: string;
  type: SegmentType;
  selected: boolean;
  title: string;
}

export interface CustomerSummary {
  isFullyCompliant: boolean;
  complianceRate: number;
  totalAlerts: number;
  alertDetails: {
    time: string;
    duration: string;
    maxTemp: string;
    location: string;
    cause: string;
    action: string;
    result: string;
  }[];
  conclusion: string;
}

export interface TicketActivityLog {
  id: string;
  ticketId: string;
  type: TicketLogType;
  timestamp: string;
  operator: string;
  oldValue?: string;
  newValue?: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface DisputeTicket {
  id: string;
  waybillId: string;
  waybillIdDisplay: string;
  customerName: string;
  riskLevel: RiskLevel;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  resolution?: string;
  followUpDate?: string;
  tags: string[];
  activityLogs: TicketActivityLog[];
}

export interface CustomerExplainPackage {
  id: string;
  customerName: string;
  createdAt: string;
  createdBy: string;
  waybillIds: string[];
  totalAlerts: number;
  severeAlerts: number;
  minorAlerts: number;
  avgComplianceRate: number;
  conclusion: string;
  waybillSummaries: {
    waybillId: string;
    waybillIdDisplay: string;
    shipmentDate: string;
    route: string;
    goodsType: string;
    complianceRate: number;
    alerts: number;
    alertDetails: {
      time: string;
      duration: string;
      maxTemp: string;
      location: string;
      cause: string;
      action: string;
      result: string;
    }[];
  }[];
}

export interface CertificateVersion {
  id: string;
  waybillId: string;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  purpose: VersionPurpose;
  customNote?: string;
  selectedSegmentIds: string[];
  summarySnapshot: CustomerSummary;
}

export interface CustomerExceptionSummary {
  customerName: string;
  totalWaybills: number;
  totalAlerts: number;
  severeAlerts: number;
  minorAlerts: number;
  last30DaysWaybills: number;
  last30DaysAlerts: number;
  complianceRateAvg: number;
  riskWaybills: string[];
  latestExceptionDate: string;
}

export interface SearchFilters {
  waybillId: string;
  customerName: string;
  shipmentDate: string;
  riskLevel: RiskLevel | 'all';
  ticketStatus: TicketStatus | 'all';
  viewMode: 'waybill' | 'ticket';
}

export interface AppState {
  waybills: Waybill[];
  selectedWaybill: Waybill | null;
  temperatureReadings: TemperatureReading[];
  timelineEvents: TimelineEvent[];
  alertRecords: AlertRecord[];
  handlingActions: HandlingAction[];
  signatureNodes: SignatureNode[];
  selectedAlertId: string | null;
  selectedTimelineEventId: string | null;
  certificateSegments: CertificateSegment[];
  customerSummary: CustomerSummary | null;
  searchFilters: SearchFilters;
  disputeTickets: DisputeTicket[];
  certificateVersions: CertificateVersion[];
  customerSummaries: CustomerExceptionSummary[];
  explainPackages: CustomerExplainPackage[];
  selectedTicketId: string | null;
  selectedVersionId: string | null;
  setSelectedWaybill: (waybill: Waybill | null) => void;
  setSelectedAlertId: (id: string | null) => void;
  setSelectedTimelineEventId: (id: string | null) => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  toggleSegment: (id: string) => void;
  selectAllSegments: () => void;
  clearSegments: () => void;
  resetSearchFilters: () => void;
  loadWaybillData: (waybillId: string) => void;
  generateCustomerSummary: () => void;
  generateSegmentBasedSummary: () => void;
  getFilteredWaybills: () => Waybill[];
  getAlertById: (id: string) => AlertRecord | undefined;
  getHandlingActionByAlertId: (alertId: string) => HandlingAction | undefined;
  getSignatureNodesByWaybillId: (waybillId: string) => SignatureNode[];
  createDisputeTicket: (ticket: Omit<DisputeTicket, 'id' | 'createdAt' | 'updatedAt' | 'activityLogs'>) => void;
  updateDisputeTicket: (id: string, updates: Partial<DisputeTicket>) => void;
  changeTicketStatus: (id: string, newStatus: TicketStatus, remark?: string) => void;
  addTicketRemark: (id: string, content: string) => void;
  getFilteredTickets: () => DisputeTicket[];
  saveCertificateVersion: (purpose: VersionPurpose, customNote?: string) => void;
  getVersionsByWaybillId: (waybillId: string) => CertificateVersion[];
  restoreCertificateVersion: (versionId: string) => void;
  getCustomerExceptionSummary: (customerName: string) => CustomerExceptionSummary | undefined;
  generateCustomerExplainPackage: (customerName: string, selectedWaybillIds?: string[]) => CustomerExplainPackage;
}
