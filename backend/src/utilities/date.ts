const validateCalendarParam = (val: string) => {
  return validateDateFormat(val) && validateYear(val) && validateMonth(val);
};

const validateDateFormat = (val: string) => {
  if (!val) return true;
  const dateRegex = /^\d{4}-(?:0[1-9]|1[0-2])$/;
  return dateRegex.test(val);
};

const validateYear = (val: string) => {
  if (!val) return true;
  const [year] = val.split("-").map(Number);
  return year !== undefined && !isNaN(year) && year.toString().length === 4;
};

const validateMonth = (val: string) => {
  if (!val) return true;
  const [, month] = val.split("-").map(Number);
  return month !== undefined && !isNaN(month) && month >= 1 && month <= 12;
};

const validateFutureDate = (val: string) => {
  if (!val) return true;
  const [year, month] = val.split("-").map(Number);
  if (year === undefined || month === undefined || isNaN(year) || isNaN(month)) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // months are 0-indexed

  return year < currentYear || (year === currentYear && month <= currentMonth);
};

const convertToDate = (val: string) => {
  if (!val) {
    return new Date();
  }
  const [year, month] = val.split("-").map(Number);
  return new Date(year!, month! - 1);
};

const validateYearMonth = (val: string) => {
  if (/^-?\d+$/.test(val)) {
    return false;
  }
  const date = new Date(val);
  return (
    date instanceof Date &&
    !isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === val.slice(0, 10)
  );
};

export { validateYearMonth, validateFutureDate, convertToDate, validateCalendarParam };
