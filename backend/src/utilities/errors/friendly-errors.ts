type ErrorMessages = Record<string, string>;

interface ForeignKeyError {
  column: string;
  table: string;
}

const FRIENDLY_ERROR_MESSAGES = {
  conflict: {
    users: {
      id: "User already exists. Please try again.",
      username: "Username has been taken. Please try another username.",
    },
  } as Record<string, ErrorMessages>,
  
  foreignKey: {
    users: "User does not exist.",
    groups: "Group does not exist.",
    posts: "Post does not exist.",
    invitations: "Invitation does not exist.",
  } as Record<string, string>,
  
  default: "The value you provided already exists or is invalid. Please try again."
} as const;

// regex pattern from database error details
const DB_ERROR_DETAILS_REGEX = {
  conflict: /Key \((\w+)\)=\((.+?)\) already exists\./,
  foreignKey: /Key \((\w+)\)=\((.+?)\) is not present in table "(\w+)"/,
} as const;

// parse the database error details from regex pattern
class ErrorParser {
  static parseConflictError(detail: string): string | undefined {
    const match = detail.match(DB_ERROR_DETAILS_REGEX.conflict);
    return match?.[1];
  }

  static parseForeignKeyError(detail: string): ForeignKeyError | undefined {
    const match = detail.match(DB_ERROR_DETAILS_REGEX.foreignKey);
    if (!match) return undefined;
    
    const [, column = "", , table = ""] = match;
    return { column, table };
  }
}

// retrieve friendly error mesages from table name and column
class ErrorFormatter {
  static getConflictMessage(tableName: string, column: string): string | undefined {
    return FRIENDLY_ERROR_MESSAGES.conflict[tableName]?.[column];
  }

  static getForeignKeyMessage(table: string): string | undefined {
    return FRIENDLY_ERROR_MESSAGES.foreignKey[table];
  }

  static formatError(tableName: string, detail: string): string {
    const conflictColumn = ErrorParser.parseConflictError(detail);
    if (conflictColumn) {
      const message = this.getConflictMessage(tableName, conflictColumn);
      if (message) return message;
    }

    const foreignKeyError = ErrorParser.parseForeignKeyError(detail);
    if (foreignKeyError) {
      const message = this.getForeignKeyMessage(foreignKeyError.table);
      if (message) return message;
    }

    return FRIENDLY_ERROR_MESSAGES.default;
  }
}

// get friendly error message from database error
export const getFriendlyErrorMessage = (tableName: string, detail: string): string => {
  return ErrorFormatter.formatError(tableName, detail);
};