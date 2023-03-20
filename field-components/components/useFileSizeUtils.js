export function fileSizeStrToNumber (s) {
  if (!s) return undefined;

  const sizeMatch = s.match(/^([0-9]*)(k|m|g*)(b*)/);

  if (sizeMatch) {
    const num = Number(sizeMatch[1] || 0);
    const unit = (sizeMatch[2]  || '').toLowerCase();
    if (!num || !(num > -Infinity)) return '';

    let multi = 1;
    switch (unit) {
      case 'k':
        multi = 1024;
        break;
      case 'm':
        multi = 1024 * 1024;
        break;
      case 'g':
        multi = 1024 * 1024 * 1024;
        break;
      default:
        multi = 1024;
        break;
    }

    return Number(num) * multi;
  }

  return undefined;
}

export function fileSizeNumberToStr (s) {
  if (!s) return '0K';

  let sizeNum = Number(s) || 0;

  if (!sizeNum || sizeNum <= 0) return '0K';

  const unitList = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];
  let unit = 'B';
  let unitIndex = 0;

  while (sizeNum >= 1024) {
    if (unit === 'E') break;

    unit = unitList[++unitIndex];
    sizeNum /= 1024;
  }

  return `${sizeNum.toFixed(2)}${unit}`;
}
