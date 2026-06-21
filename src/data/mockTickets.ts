import type { DisputeTicket, CertificateVersion, CustomerExceptionSummary, CustomerExplainPackage, TicketActivityLog } from '@/types';

const makeLog = (
  id: string,
  ticketId: string,
  type: TicketActivityLog['type'],
  timestamp: string,
  operator: string,
  extra: Partial<TicketActivityLog> = {}
): TicketActivityLog => ({
  id,
  ticketId,
  type,
  timestamp,
  operator,
  ...extra,
});

const ticket1Logs: TicketActivityLog[] = [
  makeLog('L001', 'T20260619001', 'creation', '2026-06-19T14:30:00.000Z', '张晓明', {
    content: '工单创建：客户来电投诉运单 CC202606190004 出现多次温度异常',
  }),
  makeLog('L002', 'T20260619001', 'status_change', '2026-06-19T14:45:00.000Z', '张晓明', {
    oldValue: 'pending',
    newValue: 'in_progress',
    content: '状态变更：待跟进 → 处理中',
  }),
  makeLog('L003', 'T20260619001', 'remark', '2026-06-19T15:20:00.000Z', '张晓明', {
    content: '已联系车队长核实：途中制冷设备确实报故障，已安排备用车辆在苏通大桥服务区接驳',
  }),
  makeLog('L004', 'T20260619001', 'material', '2026-06-19T16:00:00.000Z', '张晓明', {
    fileName: 'CC202606190004_证明材料_V1.pdf',
    content: '上传证明材料版本 V1（简要版），已发送客户邮箱',
  }),
  makeLog('L005', 'T20260619001', 'remark', '2026-06-20T09:00:00.000Z', '张晓明', {
    content: '客户反馈仍有疑问，要求更详细的处置记录和转运照片，准备重新发送完整版',
  }),
  makeLog('L006', 'T20260619001', 'material', '2026-06-20T09:15:00.000Z', '张晓明', {
    fileName: 'CC202606190004_证明材料_V2.pdf',
    content: '上传证明材料版本 V2（完整版），包含全部3次异常及处置记录',
  }),
];

const ticket2Logs: TicketActivityLog[] = [
  makeLog('L010', 'T20260619002', 'creation', '2026-06-19T16:45:00.000Z', '李雨晴', {
    content: '工单创建：客户来电询问 CC202606190002 短暂超温原因',
  }),
];

const ticket3Logs: TicketActivityLog[] = [
  makeLog('L020', 'T20260618003', 'creation', '2026-06-18T10:20:00.000Z', '王建国', {
    content: '工单创建：门店反馈签收时温度偏高',
  }),
  makeLog('L021', 'T20260618003', 'status_change', '2026-06-18T10:35:00.000Z', '王建国', {
    oldValue: 'pending',
    newValue: 'in_progress',
    content: '状态变更：待跟进 → 处理中',
  }),
  makeLog('L022', 'T20260618003', 'remark', '2026-06-18T14:10:00.000Z', '王建国', {
    content: '核实温度曲线：卸货期间开门约22分钟，温度从5.2°C短暂升至7.8°C，关门后10分钟恢复正常',
  }),
  makeLog('L023', 'T20260618003', 'material', '2026-06-18T15:00:00.000Z', '王建国', {
    fileName: 'CC202606180003_温度证明.pdf',
    content: '发送完整证明材料给门店负责人',
  }),
  makeLog('L024', 'T20260618003', 'status_change', '2026-06-19T15:30:00.000Z', '王建国', {
    oldValue: 'in_progress',
    newValue: 'resolved',
    content: '状态变更：处理中 → 已解决',
  }),
  makeLog('L025', 'T20260618003', 'remark', '2026-06-19T15:30:00.000Z', '王建国', {
    content: '门店确认收到证明材料，温度疑问已澄清，工单关闭',
  }),
];

const ticket4Logs: TicketActivityLog[] = [
  makeLog('L030', 'T20260618004', 'creation', '2026-06-18T11:00:00.000Z', '张晓明', {
    content: '工单创建：QA 部门例行抽查高风险客户',
  }),
];

const ticket5Logs: TicketActivityLog[] = [
  makeLog('L040', 'T20260617005', 'creation', '2026-06-17T08:50:00.000Z', '陈海波', {
    content: '工单创建：盒马鲜生配送近30天5票运单均有异常',
  }),
  makeLog('L041', 'T20260617005', 'status_change', '2026-06-17T09:30:00.000Z', '陈海波', {
    oldValue: 'pending',
    newValue: 'in_progress',
    content: '状态变更：待跟进 → 处理中',
  }),
  makeLog('L042', 'T20260617005', 'remark', '2026-06-18T16:00:00.000Z', '陈海波', {
    content: '初步分析：5票异常均集中在同一条线路，怀疑线路上的冷藏车有问题',
  }),
  makeLog('L043', 'T20260617005', 'status_change', '2026-06-19T11:20:00.000Z', '陈海波', {
    oldValue: 'in_progress',
    newValue: 'escalated',
    content: '状态变更：处理中 → 已升级（超出客服权限，需运营经理介入）',
  }),
  makeLog('L044', 'T20260617005', 'assignment', '2026-06-19T11:20:00.000Z', '陈海波', {
    content: '已上报运营经理赵明，等待进一步指示',
  }),
];

export const mockTickets: DisputeTicket[] = [
  {
    id: 'T20260619001',
    waybillId: 'CC202606190004',
    waybillIdDisplay: 'CC202606190004',
    customerName: '海霸王水产批发',
    riskLevel: 'severe',
    status: 'in_progress',
    priority: 'high',
    assignee: '张晓明',
    createdAt: '2026-06-19T14:30:00.000Z',
    updatedAt: '2026-06-20T09:15:00.000Z',
    title: '客户投诉设备故障导致温度异常',
    description: '客户反映运输途中多次温度报警，怀疑设备故障，要求给出详细说明和赔偿方案。',
    tags: ['设备故障', '客户投诉', '高价值货物'],
    activityLogs: ticket1Logs,
  },
  {
    id: 'T20260619002',
    waybillId: 'CC202606190002',
    waybillIdDisplay: 'CC202606190002',
    customerName: '顺丰优选冷链',
    riskLevel: 'minor',
    status: 'pending',
    priority: 'medium',
    assignee: '李雨晴',
    createdAt: '2026-06-19T16:45:00.000Z',
    updatedAt: '2026-06-19T16:45:00.000Z',
    title: '运单短暂超温待确认',
    description: '运输途中出现一次25分钟短暂超温，客户来电询问原因，需要核实处理记录。',
    followUpDate: '2026-06-22T00:00:00.000Z',
    tags: ['短暂超温', '客户查询'],
    activityLogs: ticket2Logs,
  },
  {
    id: 'T20260618003',
    waybillId: 'CC202606180003',
    waybillIdDisplay: 'CC202606180003',
    customerName: '钱大妈生鲜',
    riskLevel: 'minor',
    status: 'resolved',
    priority: 'medium',
    assignee: '王建国',
    createdAt: '2026-06-18T10:20:00.000Z',
    updatedAt: '2026-06-19T15:30:00.000Z',
    title: '门店签收温度疑问已解决',
    description: '门店反映签收时温度显示偏高，经核实为开门卸货导致，已向客户解释清楚。',
    resolution: '已向客户发送完整证明材料，客户确认无误，案件关闭。',
    tags: ['开门卸货', '已解决'],
    activityLogs: ticket3Logs,
  },
  {
    id: 'T20260618004',
    waybillId: 'CC202606180001',
    waybillIdDisplay: 'CC202606180001',
    customerName: '海霸王水产批发',
    riskLevel: 'minor',
    status: 'pending',
    priority: 'low',
    assignee: '张晓明',
    createdAt: '2026-06-18T11:00:00.000Z',
    updatedAt: '2026-06-18T11:00:00.000Z',
    title: '例行抽查运单留痕',
    description: '质量保证部门例行抽查高风险客户运单，需要整理近期3票异常记录。',
    tags: ['质量抽查', '内部流程'],
    activityLogs: ticket4Logs,
  },
  {
    id: 'T20260617005',
    waybillId: 'CC202606170005',
    waybillIdDisplay: 'CC202606170005',
    customerName: '盒马鲜生配送',
    riskLevel: 'severe',
    status: 'escalated',
    priority: 'high',
    assignee: '陈海波',
    createdAt: '2026-06-17T08:50:00.000Z',
    updatedAt: '2026-06-19T11:20:00.000Z',
    title: '批量运单异常需升级处理',
    description: '同一客户近期5票运单均有温度波动，已超出客服权限，需要运营经理介入。',
    tags: ['批量异常', '已升级', '重点客户'],
    activityLogs: ticket5Logs,
  },
];

export const mockVersions: CertificateVersion[] = [
  {
    id: 'V20260619001',
    waybillId: 'CC202606190004',
    versionNumber: 1,
    createdAt: '2026-06-19T10:15:00.000Z',
    createdBy: '张晓明',
    purpose: 'customer_query',
    customNote: '第一次发给客户的简要版本，只说明异常情况',
    selectedSegmentIds: ['seg-alert-1', 'seg-alert-2'],
    summarySnapshot: {
      isFullyCompliant: false,
      complianceRate: 92.5,
      totalAlerts: 2,
      alertDetails: [
        {
          time: '06-19 09:30',
          duration: '45 分钟',
          maxTemp: '-12.3°C',
          location: 'G15沈海高速南通段',
          cause: '设备故障导致温度异常',
          action: '紧急联系维修人员并派备用车',
          result: '温度已恢复正常',
        },
      ],
      conclusion: '尊敬的海霸王水产批发客户，您好！您咨询的运单 CC202606190004 全程温度合规率为 92.5%，共出现 2 次温度波动，均已记录并及时处置。其中在 G15 沈海高速南通段因设备故障出现一次45分钟超温，我们已紧急联系维修人员并派遣备用车辆完成转运，后续温度均已恢复正常范围。感谢您的理解与信任！',
    },
  },
  {
    id: 'V20260619002',
    waybillId: 'CC202606190004',
    versionNumber: 2,
    createdAt: '2026-06-19T14:50:00.000Z',
    createdBy: '张晓明',
    purpose: 'complaint',
    customNote: '客户投诉后发送的完整版，包含所有异常和处置记录',
    selectedSegmentIds: ['seg-full', 'seg-alert-1', 'seg-alert-2', 'seg-alert-3', 'seg-sig-1', 'seg-sig-2'],
    summarySnapshot: {
      isFullyCompliant: false,
      complianceRate: 92.5,
      totalAlerts: 3,
      alertDetails: [
        {
          time: '06-19 09:30',
          duration: '45 分钟',
          maxTemp: '-12.3°C',
          location: 'G15沈海高速南通段',
          cause: '设备故障导致温度异常',
          action: '紧急联系维修人员并派备用车',
          result: '温度已恢复正常',
        },
        {
          time: '06-19 11:20',
          duration: '30 分钟',
          maxTemp: '-10.8°C',
          location: '苏通大桥服务区',
          cause: '转运过程中温度波动',
          action: '启动备用车辆接驳并全程监控',
          result: '转运完成温度正常',
        },
        {
          time: '06-19 13:45',
          duration: '18 分钟',
          maxTemp: '-13.5°C',
          location: '上海嘉定卸货区',
          cause: '卸货开门导致温度短暂回升',
          action: '加快卸货速度减少开门时间',
          result: '卸货完成关门后恢复',
        },
      ],
      conclusion: '尊敬的海霸王水产批发客户，您好！针对您反馈的运单 CC202606190004 温度异常问题，经核实全程共出现 3 次温度波动，所有异常均已及时处置：(1) 09:30 南通段因设备故障超温 45 分钟，已紧急派备用车接驳；(2) 11:20 服务区转运期间短暂波动 30 分钟；(3) 13:45 卸货开门导致回升 18 分钟。全程温度合规率 92.5%，所有处置均有完整记录。对此给您带来的不便我们深表歉意，感谢您的监督与理解！',
    },
  },
  {
    id: 'V20260618001',
    waybillId: 'CC202606180003',
    versionNumber: 1,
    createdAt: '2026-06-18T16:20:00.000Z',
    createdBy: '王建国',
    purpose: 'customer_query',
    customNote: '门店签收温度疑问的说明',
    selectedSegmentIds: ['seg-full', 'seg-alert-1', 'seg-sig-1'],
    summarySnapshot: {
      isFullyCompliant: false,
      complianceRate: 98.2,
      totalAlerts: 1,
      alertDetails: [
        {
          time: '06-18 15:10',
          duration: '22 分钟',
          maxTemp: '7.8°C',
          location: '广州天河门店',
          cause: '开门卸货导致温度短暂回升',
          action: '加快卸货速度减少开门时长',
          result: '关门后10分钟内恢复正常',
        },
      ],
      conclusion: '尊敬的钱大妈生鲜客户，您好！您门店反映的 CC202606180003 签收温度偏高问题，经核查系卸货开门期间温度短暂回升（持续 22 分钟，最高 7.8°C），关门后 10 分钟内即恢复正常范围。全程合规率 98.2%，不影响货物品质，请您放心！',
    },
  },
];

export const mockCustomerSummaries: CustomerExceptionSummary[] = [
  {
    customerName: '海霸王水产批发',
    totalWaybills: 12,
    totalAlerts: 15,
    severeAlerts: 4,
    minorAlerts: 11,
    last30DaysWaybills: 8,
    last30DaysAlerts: 9,
    complianceRateAvg: 94.2,
    riskWaybills: ['CC202606190004', 'CC202606180001'],
    latestExceptionDate: '2026-06-19T00:00:00.000Z',
  },
  {
    customerName: '顺丰优选冷链',
    totalWaybills: 45,
    totalAlerts: 23,
    severeAlerts: 2,
    minorAlerts: 21,
    last30DaysWaybills: 28,
    last30DaysAlerts: 12,
    complianceRateAvg: 97.8,
    riskWaybills: ['CC202606190002'],
    latestExceptionDate: '2026-06-19T00:00:00.000Z',
  },
  {
    customerName: '钱大妈生鲜',
    totalWaybills: 28,
    totalAlerts: 14,
    severeAlerts: 1,
    minorAlerts: 13,
    last30DaysWaybills: 18,
    last30DaysAlerts: 7,
    complianceRateAvg: 98.1,
    riskWaybills: ['CC202606180003'],
    latestExceptionDate: '2026-06-18T00:00:00.000Z',
  },
  {
    customerName: '盒马鲜生配送',
    totalWaybills: 62,
    totalAlerts: 38,
    severeAlerts: 5,
    minorAlerts: 33,
    last30DaysWaybills: 35,
    last30DaysAlerts: 18,
    complianceRateAvg: 95.6,
    riskWaybills: ['CC202606170005'],
    latestExceptionDate: '2026-06-17T00:00:00.000Z',
  },
];

export const mockExplainPackages: CustomerExplainPackage[] = [
  {
    id: 'EXP20260619001',
    customerName: '海霸王水产批发',
    createdAt: '2026-06-19T17:30:00.000Z',
    createdBy: '张晓明',
    waybillIds: ['CC202606190004', 'CC202606180001'],
    totalAlerts: 4,
    severeAlerts: 1,
    minorAlerts: 3,
    avgComplianceRate: 95.4,
    conclusion: '尊敬的海霸王水产批发客户，您好！近期贵司有 2 票运单出现温度波动，合计 4 次异常（其中严重 1 次、轻微 3 次），平均合规率 95.4%。所有异常均已及时处置并留下完整记录，详细情况见各运单说明。如仍有疑问，请随时联系我们，感谢您的理解与信任！',
    waybillSummaries: [
      {
        waybillId: 'CC202606190004',
        waybillIdDisplay: 'CC202606190004',
        shipmentDate: '2026-06-19',
        route: '苏州冷链中心 → 上海嘉定仓',
        goodsType: '冷冻水产品（-18°C）',
        complianceRate: 92.5,
        alerts: 3,
        alertDetails: [
          {
            time: '06-19 09:30',
            duration: '45 分钟',
            maxTemp: '-12.3°C',
            location: 'G15沈海高速南通段',
            cause: '设备故障导致温度异常',
            action: '紧急联系维修人员并派备用车',
            result: '温度已恢复正常',
          },
          {
            time: '06-19 11:20',
            duration: '30 分钟',
            maxTemp: '-10.8°C',
            location: '苏通大桥服务区',
            cause: '转运过程中温度波动',
            action: '启动备用车辆接驳并全程监控',
            result: '转运完成温度正常',
          },
          {
            time: '06-19 13:45',
            duration: '18 分钟',
            maxTemp: '-13.5°C',
            location: '上海嘉定卸货区',
            cause: '卸货开门导致温度短暂回升',
            action: '加快卸货速度减少开门时间',
            result: '卸货完成关门后恢复',
          },
        ],
      },
      {
        waybillId: 'CC202606180001',
        waybillIdDisplay: 'CC202606180001',
        shipmentDate: '2026-06-18',
        route: '南京水产批发市场 → 苏州冷链中心',
        goodsType: '冷冻丸子类（-18°C）',
        complianceRate: 98.3,
        alerts: 1,
        alertDetails: [
          {
            time: '06-18 08:50',
            duration: '20 分钟',
            maxTemp: '-14.2°C',
            location: '南京装货区',
            cause: '装货开门期间温度短暂回升',
            action: '加快装货效率，减少开门时长',
            result: '关门后温度立即恢复',
          },
        ],
      },
    ],
  },
];

export const getTicketsByWaybillId = (waybillId: string): DisputeTicket[] => {
  return mockTickets.filter((t) => t.waybillId === waybillId);
};

export const getVersionsByWaybillId = (waybillId: string): CertificateVersion[] => {
  return mockVersions.filter((v) => v.waybillId === waybillId);
};

export const getCustomerSummaryByName = (customerName: string): CustomerExceptionSummary | undefined => {
  return mockCustomerSummaries.find((c) => c.customerName === customerName);
};
