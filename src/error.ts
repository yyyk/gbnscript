export enum ErrorType {
  NoError = 'NoError',
  ExpectedCharError = 'ExpectedCharError',
  ParseError = 'ParseError',
  SyntaxError = 'SyntaxError',
  ExpressionError = 'ExpressionError',
  StatementError = 'StatementError',
  TypeError = 'TypeError',
  UnknownError = 'UnknownError',
  NoValueAssignedError = 'NoValueAssignedError',
  UndeclaredVariableError = 'UndeclaredVariableError'
}

export interface ErrorInterface {
  type: ErrorType;
  message?: string;
  column?: number;
  line?: number;
}
