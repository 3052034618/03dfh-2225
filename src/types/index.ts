export type WaybillStatus = 'in_transit' | 'delivered' | 'exception';
export type RiskLevel = 'compliant' | 'minor' | 'severe';

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

export interface SearchFilters {
  waybillId: string;
  customerName: string;
  shipmentDate: string;
  riskLevel: RiskLevel | 'all';
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
  getFilteredWaybills: () => Waybill[];
  getAlertById: (id: string) => AlertRecord | undefined;
  getHandlingActionByAlertId: (alertId: string) => HandlingAction | undefined;
  getSignatureNodesByWaybillId: (waybillId: string) => SignatureNode[];
}
