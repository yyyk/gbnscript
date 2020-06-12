import { ErrorInterface, ErrorType } from './error';
import {
  lookupIdentifier,
  Token,
  TokenType
} from './tokens';

type char = string;

export interface Position {
  index: number;
  currentColumn: number;
  currentLine: number;
}

export function isWhitespace (character: char): boolean {
  return /\s/.test(character);
}

export function isLineBreak (character: char): boolean {
  return /\n|\r/.test(character);
}

export function isLetter (character: char): boolean {
  return /[a-z_]/i.test(character);
}

export function isDigit (character: char): boolean {
  return /[0-9]/.test(character);
}

export function isIdentifier (character: char): boolean {
  return isLetter(character) || isDigit(character) || character === '_'; // || character === '.' || character === '?'
}

export function createPosition (): Position {
  return {
    index: 0,
    currentColumn: 1,
    currentLine: 1
  };
}

export function createToken (type: TokenType, literal: string, column: number, line: number): Token {
  return {
    type,
    literal,
    column,
    line
  };
}

export function getNextPosition (position: Position): Position {
  return {
    index: position.index + 1,
    currentColumn: position.currentColumn + 1,
    currentLine: position.currentLine
  };
}

export function currentChar (input: string, position: Position): char {
  return input.charAt(position.index);
}

export function nextChar (input: string, position: Position): char {
  return input.charAt(position.index + 1);
}

export function readNumber (input: string, position: Position): [string, Position] {
  let pos: Position = { ...position };

  let str: string = '';
  let accept: string = '0123456789';

  // hexadecimal
  if (currentChar(input, pos) === '0' && nextChar(input, pos) === 'x') {
    accept = '0x123456789abcdefABCDEF';
  }
  // binary digits
  if (currentChar(input, pos) === '0' && nextChar(input, pos) === 'b') {
    accept = 'b01';
  }
  while (pos.index < input.length && currentChar(input, pos) !== '' && accept.includes(currentChar(input, pos))) {
    str += currentChar(input, pos);
    pos = getNextPosition(pos);
  }

  return [str, pos];
}

export function readDecimal (input: string, position: Position): [Token, Position] {
  // tslint:disable-next-line: prefer-const
  let [integer, pos]: [string, Position] = readNumber(input, position);

  if (currentChar(input, pos) === '.' && isDigit(nextChar(input, pos))) {
    pos = getNextPosition(pos);
    const [fraction, fractionPos]: [string, Position] = readNumber(input, pos);
    const literal = integer + '.' + fraction;
    return [
      {
        type: TokenType.Float,
        literal,
        column: fractionPos.currentColumn - literal.length,
        line: fractionPos.currentLine
      },
      fractionPos
    ];
  }

  return [
    {
      type: TokenType.Int,
      literal: integer,
      column: pos.currentColumn - integer.length,
      line: pos.currentLine
    },
    pos
  ];
}

export function readIdentifier (input: string, position: Position): [string, Position] {
  let pos: Position = { ...position };
  let identifier: string = '';

  while (pos.index < input.length && isIdentifier(currentChar(input, pos))) {
    identifier += currentChar(input, pos);
    pos = getNextPosition(pos);
  }

  return [identifier, pos];
}

export function skipWhitespace (input: string, position: Position): Position {
  let pos: Position = { ...position };

  while (pos.index < input.length && isWhitespace(currentChar(input, pos))) {
    // TODO: if next token is EOF, dont call getNextPosition
    if (isLineBreak(currentChar(input, pos))) {
      pos.currentColumn = 0;
      pos.currentLine += 1;
    }
    pos = getNextPosition(pos);
  }

  return pos;
}

export function skipComment (input: string, position: Position): Position {
  let pos: Position = { ...position };

  while (pos.index < input.length && currentChar(input, pos) !== '\n' && currentChar(input, pos) !== '') {
    pos = getNextPosition(pos);
  }
  // pos = skipWhitespace(input, pos);

  return pos;
}

export function nextToken (input: string, position?: Position): [Token, Position, ErrorInterface] {
  let pos: Position = position
    ? { ...position }
    : createPosition();

  pos = skipWhitespace(input, pos);

  if (currentChar(input, pos) === '/' && nextChar(input, pos) === '/') {
    pos = skipComment(input, pos);
    return nextToken(input, pos);
  }

  const currentCharacter = currentChar(input, pos);
  let token: Token = createToken(TokenType.Illegal, currentCharacter, pos.currentColumn, pos.currentLine);

  switch (currentCharacter) {
    // Operators
    case '+':
      token = createToken(TokenType.Plus, currentCharacter, pos.currentColumn, pos.currentLine);
      break;
    case '-':
      token = createToken(TokenType.Minus, currentCharacter, pos.currentColumn, pos.currentLine);
      break;
    case '*':
      if (nextChar(input, pos) === '*') {
        pos = getNextPosition(pos);
        token = createToken(TokenType.Pow, currentCharacter + currentChar(input, pos), pos.currentColumn - 1, pos.currentLine);
      } else {
        token = createToken(TokenType.Asterisk, currentCharacter, pos.currentColumn, pos.currentLine);
      }
      break;
    case '/':
      token = createToken(TokenType.Slash, currentCharacter, pos.currentColumn, pos.currentLine);
      break;
    case '%':
      token = createToken(TokenType.Mod, currentCharacter, pos.currentColumn, pos.currentLine);
      break;

    // Comparator
    case '=':
      if (nextChar(input, pos) === '=') {
        pos = getNextPosition(pos);
        token = createToken(TokenType.Equal, currentCharacter + currentChar(input, pos), pos.currentColumn - 1, pos.currentLine);
      } else {
        return [
          token,
          pos,
          {
            type: ErrorType.ExpectedCharError,
            message: `'=' is missing after '='.`,
            line: pos.currentLine,
            column: pos.currentColumn + 1
          }
        ];
      }
      break;
    case '!':
      if (nextChar(input, pos) === '=') {
        pos = getNextPosition(pos);
        token = createToken(TokenType.NotEqual, currentCharacter + currentChar(input, pos), pos.currentColumn - 1, pos.currentLine);
      } else {
        return [
          token,
          pos,
          {
            type: ErrorType.ExpectedCharError,
            message: `'=' is missing after '!'.`,
            line: pos.currentLine,
            column: pos.currentColumn + 1
          }
        ];
      }
      break;
    case '<':
      if (nextChar(input, pos) === '=') {
        pos = getNextPosition(pos);
        token = createToken(TokenType.LessThanEqual, currentCharacter + currentChar(input, pos), pos.currentColumn - 1, pos.currentLine);
      } else {
        token = createToken(TokenType.LessThan, currentCharacter, pos.currentColumn, pos.currentLine);
      }
      break;
    case '>':
      if (nextChar(input, pos) === '=') {
        pos = getNextPosition(pos);
        token = createToken(TokenType.GreaterThanEqual, currentCharacter + currentChar(input, pos), pos.currentColumn - 1, pos.currentLine);
      } else {
        token = createToken(TokenType.GreaterThan, currentCharacter, pos.currentColumn, pos.currentLine);
      }
      break;

    // Parenthesis
    case '(':
      token = createToken(TokenType.LeftParenthesis, currentCharacter, pos.currentColumn, pos.currentLine);
      break;
    case ')':
      token = createToken(TokenType.RightParenthesis, currentCharacter, pos.currentColumn, pos.currentLine);
      break;

    // Semicolon
    case ';':
      token = createToken(TokenType.Semicolon, currentCharacter, pos.currentColumn, pos.currentLine);
      break;

    // EOF
    case '':
      return [
        createToken(TokenType.EOF, '', pos.currentColumn, pos.currentLine),
        pos,
        { type: ErrorType.NoError }
      ];

    //
    case '.':
      return [
        token,
        pos,
        {
          type: ErrorType.ExpectedCharError,
          message: `numbers are expected before and after '.'.`,
          line: pos.currentLine,
          column: pos.currentColumn + 1
        }
      ];

    // Int, Float, Keywords, Identifier
    default:
      if (isDigit(currentCharacter)) {
        [token, pos] = readDecimal(input, pos);
        return [token, pos, { type: ErrorType.NoError }];
      } else if (isLetter(currentCharacter)) {
        const [identifier, newPos] = readIdentifier(input, pos);
        token = createToken(lookupIdentifier(identifier), identifier, newPos.currentColumn - identifier.length, newPos.currentLine);
        return [token, newPos, { type: ErrorType.NoError }];
      }
  }
  pos = getNextPosition(pos);
  return [token, pos, { type: ErrorType.NoError }];
}

export function tokenize (input: string): [Token[], ErrorInterface|null] {
  let pos: Position = createPosition();
  const tokens: Token[] = [];
  while (true) {
    const token = nextToken(input, pos);
    pos = token[1];
    if (token[2].type !== ErrorType.NoError) {
      return [[], token[2]];
    }
    tokens.push(token[0]);
    if (token[0].type === TokenType.EOF) {
      break;
    }
  }
  return [tokens, null];
}
