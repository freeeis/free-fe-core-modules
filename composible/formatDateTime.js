const pad = (value) => String(value).padStart(2, '0');

export default function formatDateTime(value, includeSeconds = true) {
  if (value === void 0 || value === null || value === '') return '';

  let date = new Date(value);
  if (Number.isNaN(date.getTime()) && typeof value === 'string') {
    date = new Date(value.replace(/-/g, '/'));
  }
  if (Number.isNaN(date.getTime())) return '';

  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${datePart} ${time}${includeSeconds ? `:${pad(date.getSeconds())}` : ''}`;
}
