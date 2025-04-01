export const formatBirthday = (birthday?: Date | null) => {
  if (!birthday) {
    return "MM/DD/YYYY";
  }

  const date = new Date(birthday);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
};
