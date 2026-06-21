import type { Waybill, AlertRecord, HandlingAction, CustomerSummary } from '@/types';
import { formatDateTime, formatDuration, formatTemperature, formatPercentage } from './format';

export const generateCustomerSummary = (
  waybill: Waybill,
  alerts: AlertRecord[],
  handlingActions: HandlingAction[]
): CustomerSummary => {
  const isFullyCompliant = waybill.complianceRate >= 99.5;

  const alertDetails = alerts.map((alert) => {
    const action = handlingActions.find((a) => a.alertRecordId === alert.id);
    const cause = determineCause(alert, handlingActions);

    return {
      time: formatDateTime(alert.startTime),
      duration: formatDuration(alert.durationMinutes),
      maxTemp: formatTemperature(alert.maxTemperature),
      location: alert.location,
      cause,
      action: action?.action || '已记录并处理',
      result: action?.result || '温度已恢复正常',
    };
  });

  const conclusion = generateConclusion(waybill, alerts);

  return {
    isFullyCompliant,
    complianceRate: waybill.complianceRate,
    totalAlerts: alerts.length,
    alertDetails,
    conclusion,
  };
};

const determineCause = (
  alert: AlertRecord,
  handlingActions: HandlingAction[]
): string => {
  const action = handlingActions.find((a) => a.alertRecordId === alert.id);
  if (!action) return '温度波动原因待确认';

  const remark = action.remark || '';
  const result = action.result || '';
  const fullText = remark + result;

  if (fullText.includes('开门') || fullText.includes('卸货') || fullText.includes('检查')) {
    return '装卸货/开门检查导致温度短暂回升';
  }
  if (fullText.includes('制冷') && fullText.includes('停机')) {
    return '制冷系统短暂停机后自动恢复';
  }
  if (fullText.includes('堵车') || fullText.includes('怠速')) {
    return '交通拥堵导致车辆怠速降温较慢';
  }
  if (fullText.includes('故障') || fullText.includes('维修')) {
    return '设备故障导致温度异常';
  }
  if (fullText.includes('转运')) {
    return '紧急转运过程中温度波动';
  }
  if (fullText.includes('节能') || fullText.includes('休息')) {
    return '车辆休息时制冷系统节能模式导致';
  }

  return '温度波动，已排查确认无异常';
};

const generateConclusion = (
  waybill: Waybill,
  alerts: AlertRecord[]
): string => {
  const { complianceRate, customerName, goodsType, alertCount } = waybill;

  if (complianceRate >= 99.5 && alertCount === 0) {
    return `尊敬的${customerName}客户，您好！您托运的${goodsType}全程冷链运输合规率为${formatPercentage(complianceRate)}，温度稳定在要求范围内，未出现任何温度异常，货物品质有充分保障。`;
  }

  if (complianceRate >= 98) {
    const alertText = alertCount === 1 ? '1次温度短暂波动' : `${alertCount}次温度短暂波动`;
    const hasSevere = alerts.some((a) => a.durationMinutes > 30);

    if (hasSevere) {
      return `尊敬的${customerName}客户，您好！您托运的${goodsType}运输过程中出现${alertText}，均已及时处理并恢复正常。整体合规率为${formatPercentage(complianceRate)}，温度超标时间较短，且所有异常均有明确的原因说明和处置记录，不影响货物品质。`;
    }

    return `尊敬的${customerName}客户，您好！您托运的${goodsType}运输过程中出现${alertText}，均为装卸货或开门检查导致的短暂温度回升，持续时间短且恢复迅速。整体合规率为${formatPercentage(complianceRate)}，货物品质未受影响。`;
  }

  if (complianceRate >= 95) {
    return `尊敬的${customerName}客户，您好！您托运的${goodsType}运输过程中出现${alertCount}次温度异常，我司调度中心已第一时间响应处理，包括联系司机排查、远程监控、甚至启动备用车辆转运等措施。虽然整体合规率为${formatPercentage(complianceRate)}，但所有异常均有完整的处置记录，且最终送达时货物经检验品质完好，请您放心。`;
  }

  return `尊敬的${customerName}客户，您好！您托运的${goodsType}运输过程中遇到设备故障等不可抗力因素，出现${alertCount}次温度异常，我司已立即启动应急预案，包括：① 紧急联系维修人员 ② 派出备用车辆接驳 ③ 全程监控温度并每5分钟记录一次。虽然合规率为${formatPercentage(complianceRate)}，但货物送达时经质检确认品质未受影响。我司已针对此次异常进行复盘，将加强设备预防性维护，避免类似情况再次发生。`;
};

export const generateSummaryScript = (summary: CustomerSummary, waybill: Waybill): string => {
  const { isFullyCompliant, complianceRate, totalAlerts, alertDetails, conclusion } = summary;

  let script = `【客服解释话术】\n\n`;
  script += `开场白："您好，关于运单 ${waybill.id} 的温度查询，我为您详细说明一下情况。"\n\n`;
  script += `一、整体情况：\n`;
  script += `  • 合规率：${formatPercentage(complianceRate)}\n`;
  script += `  • 异常次数：${totalAlerts} 次\n`;
  script += `  • 结论：${isFullyCompliant ? '全程温度合规，无任何异常' : '有温度波动但均已处理'}\n\n`;

  if (totalAlerts > 0) {
    script += `二、异常详情：\n`;
    alertDetails.forEach((detail, index) => {
      script += `  ${index + 1}. ${detail.time}\n`;
      script += `     • 持续时长：${detail.duration}\n`;
      script += `     • 最高温度：${detail.maxTemp}\n`;
      script += `     • 发生位置：${detail.location}\n`;
      script += `     • 原因分析：${detail.cause}\n`;
      script += `     • 我司处置：${detail.action}\n`;
      script += `     • 处理结果：${detail.result}\n\n`;
    });
  }

  script += `三、给客户的说明：\n`;
  script += `  ${conclusion}\n\n`;
  script += `结束语："以上是该运单的完整温度留痕记录和处置说明，请问您还有其他疑问吗？"\n`;

  return script;
};
