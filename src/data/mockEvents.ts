import type { TimelineEvent, HandlingAction, SignatureNode } from '@/types';

export const mockTimelineEvents: Record<string, TimelineEvent[]> = {
  'CC202606200001': [
    {
      id: 'evt-1',
      waybillId: 'CC202606200001',
      type: 'signature',
      timestamp: '2026-06-20T08:00:00',
      title: '发货签收',
      description: '货物在上海冷链仓库装车完成，发车确认',
      severity: 'info',
    },
    {
      id: 'evt-2',
      waybillId: 'CC202606200001',
      type: 'door_open',
      timestamp: '2026-06-20T14:05:00',
      title: '车门开启',
      description: '济南服务区临时停车检查货物',
      severity: 'warning',
    },
    {
      id: 'evt-3',
      waybillId: 'CC202606200001',
      type: 'door_close',
      timestamp: '2026-06-20T14:53:00',
      title: '车门关闭',
      description: '检查完成，车门关闭继续运输',
      severity: 'info',
    },
    {
      id: 'evt-4',
      waybillId: 'CC202606200001',
      type: 'alert',
      timestamp: '2026-06-20T14:10:00',
      title: '温度报警',
      description: '车厢温度升至 -10.5°C，超出要求温区上限 -12°C',
      severity: 'danger',
    },
    {
      id: 'evt-5',
      waybillId: 'CC202606200001',
      type: 'remark',
      timestamp: '2026-06-20T14:15:00',
      title: '人工备注',
      description: '调度员王经理已联系司机确认，系服务区开门检查导致温度回升，属正常操作',
      severity: 'info',
    },
    {
      id: 'evt-6',
      waybillId: 'CC202606200001',
      type: 'alert',
      timestamp: '2026-06-20T20:05:00',
      title: '温度报警',
      description: '车厢温度升至 -9.8°C，超出要求温区上限',
      severity: 'danger',
    },
    {
      id: 'evt-7',
      waybillId: 'CC202606200001',
      type: 'door_open',
      timestamp: '2026-06-20T20:00:00',
      title: '车门开启',
      description: '北京仓库卸货准备',
      severity: 'warning',
    },
    {
      id: 'evt-8',
      waybillId: 'CC202606200001',
      type: 'signature',
      timestamp: '2026-06-21T02:30:00',
      title: '收货签收',
      description: '货物已送达北京，客户确认签收',
      severity: 'info',
    },
  ],
  'CC202606190003': [
    {
      id: 'evt-1',
      waybillId: 'CC202606190003',
      type: 'signature',
      timestamp: '2026-06-19T09:00:00',
      title: '发货签收',
      description: '蛋糕装车完成，发车确认',
      severity: 'info',
    },
    {
      id: 'evt-2',
      waybillId: 'CC202606190003',
      type: 'alert',
      timestamp: '2026-06-19T11:30:00',
      title: '温度报警',
      description: '温度升至 8.2°C，超出要求温区上限 6°C',
      severity: 'danger',
    },
    {
      id: 'evt-3',
      waybillId: 'CC202606190003',
      type: 'remark',
      timestamp: '2026-06-19T11:40:00',
      title: '人工备注',
      description: '制冷系统自检恢复正常，温度已回落',
      severity: 'info',
    },
    {
      id: 'evt-4',
      waybillId: 'CC202606190003',
      type: 'signature',
      timestamp: '2026-06-19T13:48:00',
      title: '收货签收',
      description: '货物已送达重庆，客户确认签收',
      severity: 'info',
    },
  ],
};

export const mockHandlingActions: Record<string, HandlingAction[]> = {
  'CC202606200001': [
    {
      id: 'action-1',
      alertRecordId: 'alert-1',
      timestamp: '2026-06-20T14:12:00',
      operator: '王经理（调度）',
      action: '电话联系司机确认情况，检查制冷设备运行状态',
      result: '司机反馈在济南服务区开门检查货物，制冷设备正常',
      remark: '开门导致温度短暂回升，5分钟后恢复正常',
    },
    {
      id: 'action-2',
      alertRecordId: 'alert-2',
      timestamp: '2026-06-20T20:08:00',
      operator: '李主管（调度）',
      action: '联系司机确认',
      result: '司机已到达北京仓库，正在开门卸货',
      remark: '正常卸货操作，温度回升属预期范围内',
    },
  ],
  'CC202606190003': [
    {
      id: 'action-1',
      alertRecordId: 'alert-1',
      timestamp: '2026-06-19T11:35:00',
      operator: '张调度',
      action: '远程检查设备日志，联系司机',
      result: '制冷系统短暂停机3分钟后自动恢复，无设备故障排除',
      remark: '温度最高8.2°C，未影响产品质量',
    },
  ],
};

export const mockSignatureNodes: Record<string, SignatureNode[]> = {
  'CC202606200001': [
    {
      id: 'sig-1',
      waybillId: 'CC202606200001',
      type: 'departure',
      timestamp: '2026-06-20T08:00:00',
      location: '上海冷链物流中心',
      operator: '仓库管理员 刘师傅',
      signatureUrl: '/signatures/departure-1.png',
    },
    {
      id: 'sig-2',
      waybillId: 'CC202606200001',
      type: 'transit',
      timestamp: '2026-06-20T14:30:00',
      location: '济南中转仓',
      operator: '中转站 王站长',
      signatureUrl: '/signatures/transit-1.png',
    },
    {
      id: 'sig-3',
      waybillId: 'CC202606200001',
      type: 'delivery',
      timestamp: '2026-06-21T02:30:00',
      location: '北京鲜优生鲜配送中心',
      operator: '鲜优生鲜 陈收货',
      signatureUrl: '/signatures/delivery-1.png',
    },
  ],
};

export const getEventsByWaybillId = (waybillId: string): TimelineEvent[] => {
  return mockTimelineEvents[waybillId] || [];
};

export const getHandlingActionsByWaybillId = (waybillId: string): HandlingAction[] => {
  return mockHandlingActions[waybillId] || [];
};

export const getSignatureNodesByWaybillId = (waybillId: string): SignatureNode[] => {
  return mockSignatureNodes[waybillId] || [];
};
