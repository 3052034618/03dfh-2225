export const formatDateTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} 分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) {
    return mins > 0 ? `${hours} 小时 ${mins} 分钟` : `${hours} 小时`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return remainingHours > 0
    ? `${days} 天 ${remainingHours} 小时`
    : `${days} 天`;
};

export const formatDurationHours = (hours: number): string => {
  if (hours < 24) {
    return `${hours.toFixed(1)} 小时`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = (hours % 24).toFixed(1);
  return `${days} 天 ${remainingHours} 小时`;
};

export const formatTemperature = (temp: number): string => {
  return `${temp.toFixed(1)}°C`;
};

export const formatTempRange = (min: number, max: number): string => {
  return `${min.toFixed(0)}°C ~ ${max.toFixed(0)}°C`;
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(value);
};

export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    in_transit: '运输中',
    delivered: '已签收',
    exception: '异常',
  };
  return statusMap[status] || status;
};

export const formatEventTitle = (type: string): string => {
  const typeMap: Record<string, string> = {
    alert: '温度报警',
    door_open: '开门',
    door_close: '关门',
    remark: '人工备注',
    signature: '签收节点',
  };
  return typeMap[type] || type;
};

export const formatSignatureType = (type: string): string => {
  const typeMap: Record<string, string> = {
    departure: '发货',
    transit: '中转',
    delivery: '签收',
  };
  return typeMap[type] || type;
};

export const getStatusBadgeClass = (status: string): string => {
  const classMap: Record<string, string> = {
    in_transit: 'badge-info',
    delivered: 'badge-success',
    exception: 'badge-danger',
  };
  return classMap[status] || 'badge-info';
};

export const getSeverityBadgeClass = (severity: string): string => {
  const classMap: Record<string, string> = {
    info: 'badge-info',
    warning: 'badge-warning',
    danger: 'badge-danger',
  };
  return classMap[severity] || 'badge-info';
};

export const getEventColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    alert: '#EF4444',
    door_open: '#F59E0B',
    door_close: '#10B981',
    remark: '#64748B',
    signature: '#0EA5E9',
  };
  return colorMap[type] || '#64748B';
};

export const getTimeDiff = (start: string, end: string): number => {
  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();
  return Math.round((endDate - startDate) / 1000 / 60);
};

export const formatRiskLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    compliant: '全程合规',
    minor: '轻微异常',
    severe: '严重异常',
    all: '全部运单',
  };
  return levelMap[level] || level;
};

export const getRiskLevelBadgeClass = (level: string): string => {
  const classMap: Record<string, string> = {
    compliant: 'badge-success',
    minor: 'badge-warning',
    severe: 'badge-danger',
  };
  return classMap[level] || 'badge-info';
};

export const getRiskLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    compliant: '#10B981',
    minor: '#F59E0B',
    severe: '#EF4444',
  };
  return colorMap[level] || '#64748B';
};
