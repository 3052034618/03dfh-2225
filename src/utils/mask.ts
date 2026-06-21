export const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 7) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

export const maskIdCard = (idCard: string): string => {
  if (!idCard || idCard.length < 10) return idCard;
  return idCard.replace(/(\d{6})\d{8,11}(\d{3}[\dXx])/, '$1********$2');
};

export const maskName = (name: string): string => {
  if (!name || name.length <= 1) return name;
  if (name.length === 2) {
    return name.charAt(0) + '*';
  }
  return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1);
};

export const maskLicensePlate = (plate: string): string => {
  if (!plate || plate.length < 4) return plate;
  return plate.substring(0, 2) + '**' + plate.substring(plate.length - 2);
};

export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return email;
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return username + '***@' + domain;
  }
  return username.charAt(0) + '***' + username.charAt(username.length - 1) + '@' + domain;
};

export const maskSensitiveData = (
  data: Record<string, unknown>,
  fields: string[]
): Record<string, unknown> => {
  const result = { ...data };
  fields.forEach((field) => {
    if (result[field] && typeof result[field] === 'string') {
      const value = result[field] as string;
      if (field.includes('phone') || field.includes('mobile')) {
        result[field] = maskPhone(value);
      } else if (field.includes('name') && !field.includes('customer')) {
        result[field] = maskName(value);
      } else if (field.includes('plate') || field.includes('vehicle')) {
        result[field] = maskLicensePlate(value);
      } else if (field.includes('email')) {
        result[field] = maskEmail(value);
      } else if (field.includes('idCard') || field.includes('identity')) {
        result[field] = maskIdCard(value);
      } else {
        result[field] = '***';
      }
    }
  });
  return result;
};
