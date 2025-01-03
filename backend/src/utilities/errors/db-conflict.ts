// map a table name to specific field error conflict in that table
const DB_CONFLICT_ERROR_MESSAGES: Record<string, Record<string, string>> = {
  users: {
    id: "User already exists. Please try again.",
    username: "Username has been taken. Please try another username.",
  },
};

// parse conflict detail message to search in the map
const parseConflictDetail = (detail: string): string | undefined => {
  const conflictDetailRegex = /Key \((\w+)\)=\((.+?)\) already exists\./;
  const match = detail.match(conflictDetailRegex);
  if (match) {
    const [, column = undefined] = match;
    return column;
  }
  return undefined;
};

// format conflict error to a meaningful message for the client
export const formatConflictError = (tableName: string, detail: string): string => {
  const parsedDetail = parseConflictDetail(detail);

  if (parsedDetail) {
    const column = parsedDetail;
    const tableMessages = DB_CONFLICT_ERROR_MESSAGES[tableName];

    if (tableMessages) {
      const message = tableMessages[column];
      if (message) {
        return message;
      }
    }
  }

  // default fallback message
  return "The value you provided already exists. Please choose a different value.";
};
