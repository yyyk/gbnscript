import { ErrorInterface, ErrorType } from '../error';
import {
  isDigit,
  isIdentifier,
  isLetter,
  isLineBreak,
  isWhitespace,
  nextToken,
  Position,
  readDecimal,
  readIdentifier,
  readNumber,
  skipComment,
  skipWhitespace,
  tokenize
} from '../lexer';
import { Token, TokenType } from '../tokens';

let position: Position;

beforeEach(() => {
  position = {
    index: 0,
    currentColumn: 1,
    currentLine: 1
  };
});

describe('isWhitespace', () => {
  it('returns true if input is a white space', () => {
    const input = ' ';
    expect(isWhitespace(input)).toBeTruthy();
  });

  it('returns true if input is a line break', () => {
    const input = '\n';
    expect(isWhitespace(input)).toBeTruthy();
  });

  it('returns false if input is NOT a white space', () => {
    const input = 'a';
    expect(isWhitespace(input)).toBeFalsy();
  });
});

describe('isLineBreak', () => {
  it('returns true if input is a line break', () => {
    const input = '\n';
    expect(isLineBreak(input)).toBeTruthy();
  });

  it('returns false if input is NOT a line break', () => {
    const input = 'a';
    expect(isLineBreak(input)).toBeFalsy();
  });
});

describe('isLetter', () => {
  it('returns true if input is a letter', () => {
    const input = 'a';
    expect(isLetter(input)).toBeTruthy();
  });

  it('returns true if input is a underscore', () => {
    const input = '_';
    expect(isLetter(input)).toBeTruthy();
  });

  it('returns false if input is NOT a letter or underscore', () => {
    const input = '1';
    expect(isLetter(input)).toBeFalsy();
  });
});

describe('isDigit', () => {
  it('returns true if input is a digit', () => {
    const input = '1';
    expect(isDigit(input)).toBeTruthy();
  });

  it('returns false if input is NOT a digit', () => {
    const input = 'a';
    expect(isDigit(input)).toBeFalsy();
  });
});

describe('isIdentifier', () => {
  it('returns true if input is identifier', () => {
    const input = 'a';
    expect(isIdentifier(input)).toBeTruthy();
  });

  it('returns false if input is NOT identifier', () => {
    const input = '?';
    expect(isIdentifier(input)).toBeFalsy();
  });
});

describe('readNumber', () => {
  it('returns number in string from string input', () => {
    const input: [string, Position] = ['1000 a', position];
    const result: [string, Position] = ['1000', { index: 4, currentColumn: 5, currentLine: 1 }];
    expect(readNumber(input[0], input[1])).toEqual(result);
  });
});

describe('readDecimal', () => {
  it('returns decimal number in string from string input', () => {
    const input: [string, Position] = ['12.345 abc', position];
    const result: [Token, Position] =  [
      { type: TokenType.Float, literal: '12.345', column: 1, line: 1 },
      { index: 6, currentColumn: 7, currentLine: 1 }
    ];
    expect(readDecimal(input[0], input[1])).toEqual(result);
  });
});

describe('readIdentifier', () => {
  it ('extracts identifier from a string', () => {
    const input: [string, Position] = ['abc 12.345', position];
    const result: [string, Position] =  [ 'abc', { index: 3, currentColumn: 4, currentLine: 1 } ];
    expect(readIdentifier(input[0], input[1])).toEqual(result);
  });
});

describe('skipWhitespace', () => {
  it ('skips whitespace from a string', () => {
    const input: [string, Position] = ['    abc', position];
    const result: Position =  { index: 4, currentColumn: 5, currentLine: 1 };
    expect(skipWhitespace(input[0], input[1])).toEqual(result);
  });
});

describe('skipComment', () => {
  it ('skips whitespace from a string', () => {
    const input: [string, Position] = ['// comment \nabc', position];
    const result: Position =  { index: 11, currentColumn: 12, currentLine: 1 };
    expect(skipComment(input[0], input[1])).toEqual(result);
  });
});

describe('nextToken', () => {
  it ('returns a token, position, and error, and proceeds to next token', () => {
    const input = 'abc def 123';
    const result: [Token, Position, ErrorInterface] = [
      { type: TokenType.Identifier, literal: 'abc', column: 1, line: 1 },
      { index: 3, currentColumn: 4, currentLine: 1 },
      { type: ErrorType.NoError }
    ];
    expect(nextToken(input)).toEqual(result);
  });
});

// TODO: more test cases
describe('tokenize', () => {
  it('returns ExpectedCharError if "=" is missing after "="', () => {
    const input = '=';
    const [_, tokenError] = tokenize(input);
    expect(tokenError.type).toMatch('ExpectedCharError');
    expect(tokenError.line).toBe(1);
    expect(tokenError.column).toBe(2);
  });

  it('returns ExpectedCharError if "=" is missing after "!"', () => {
    const input = 'abc\n123\n   !';
    const [_, tokenError] = tokenize(input);
    expect(tokenError.type).toMatch('ExpectedCharError');
    expect(tokenError.line).toBe(3);
    expect(tokenError.column).toBe(5);
  });

  it('ignores comments', () => {
    const input = '// some comment';
    const [token, _] = tokenize(input);
    const result = [
      { type: TokenType.EOF, literal: '', column: 16, line: 1 }
    ];
    expect(token).toEqual(result);
  });

  it('ignores empty spaces', () => {
    const input = '  \n   ';
    const [token, _] = tokenize(input);
    const result = [
      { type: TokenType.EOF, literal: '', column: 4, line: 2 }
    ];
    expect(token).toEqual(result);
  });

  it('returns identifier and number', () => {
    const input = 'abc 12345';
    const [token, _] = tokenize(input);
    const result =[
      { type: TokenType.Identifier, literal: 'abc', column: 1, line: 1 },
      { type: TokenType.Int, literal: '12345', column: 5, line: 1 },
      { type: TokenType.EOF, literal: '', column: 10, line: 1 }
    ];
    expect(token).toEqual(result);
  });
});
