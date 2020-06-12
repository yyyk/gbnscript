import {
  AttributeStatement,
  BlockStatement,
  createAttributeStatement,
  createBlockStatement,
  createBooleanLiteral,
  createExpressionStatement,
  createFloatLiteral,
  createIdentifier,
  createIfExpression,
  createIllegalExpression,
  createIllegalStatement,
  createInfixExpression,
  createIntegerLiteral,
  createPrefixExpression,
  createProgram,
  createRepeatExpression,
  createSetStatement,
  createSizeExpression,
  createTagExpression,
  createUpdateStatement,
  Expression,
  ExpressionStatement,
  IfExpression,
  IllegalExpression,
  IllegalStatement,
  InfixExpression,
  NodeType,
  PrefixExpression,
  Program,
  RepeatExpression,
  SetStatement,
  SizeExpression,
  Statement,
  TagExpression,
  UpdateStatement
} from './ast';
import { ErrorInterface, ErrorType } from './error';
import { PrecedenceLevel, precedences } from './precedence';
import { Token, TokenType } from './tokens';

type PrefixParseFn = (tokens: Token[], index: number) => [Expression, number];
type PrefixParseFns = {[key in TokenType]: PrefixParseFn};
type InfixParseFn = (tokens: Token[], index: number, expression: Expression) => [Expression, number];
type InfixParseFns = {[key in TokenType]: InfixParseFn};

const prefixParseFns: PrefixParseFns = {
  // Identifier
  [TokenType.Identifier] (tokens: Token[], index: number): [Expression, number] {
    return [createIdentifier(tokens[index]), index];
  },
  // Int
  [TokenType.Int] (tokens: Token[], index: number): [Expression, number] {
    return [createIntegerLiteral(tokens[index]), index];
  },
  // Float
  [TokenType.Float] (tokens: Token[], index: number): [Expression, number] {
    return [createFloatLiteral(tokens[index]), index];
  },
  // LeftParenthesis
  [TokenType.LeftParenthesis]: parseLeftParenthesis,
  // Not
  [TokenType.Not]: parsePrefixExpression,
  // Minus
  [TokenType.Minus]: parsePrefixExpression,
  // Boolean
  [TokenType.True]: parseBooleanLiteral,
  [TokenType.False]: parseBooleanLiteral,
  // If
  [TokenType.If]: parseIfExpression,
  // Repeat
  [TokenType.Repeat]: parseRepeatExpression,
  // Size
  [TokenType.Size]: parseSizeExpression,
  // Tag
  [TokenType.Tag]: parseTagExpression,
  // Attribute
  [TokenType.Attribute]: parseAttributeStatement
  // TODO: EOF, Illegal
} as PrefixParseFns;

const infixParseFns: InfixParseFns = {
  // Operators
  [TokenType.Plus]: parseInfixExpression,
  [TokenType.Minus]: parseInfixExpression,
  [TokenType.Slash]: parseInfixExpression,
  [TokenType.Asterisk]: parseInfixExpression,
  [TokenType.Pow]: parseInfixExpression,
  [TokenType.Mod]: parseInfixExpression,
  // Comparator
  [TokenType.LessThan]: parseInfixExpression,
  [TokenType.GreaterThan]: parseInfixExpression,
  [TokenType.LessThanEqual]: parseInfixExpression,
  [TokenType.GreaterThanEqual]: parseInfixExpression,
  [TokenType.Equal]: parseInfixExpression,
  [TokenType.NotEqual]: parseInfixExpression,
  // Keywords
  [TokenType.And]: parseInfixExpression,
  [TokenType.Or]: parseInfixExpression
} as InfixParseFns;

// Boolean
export function parseBooleanLiteral (tokens: Token[], index: number): [Expression, number] {
  return [createBooleanLiteral(tokens[index]), index];
}

// Parenthesis
export function parseLeftParenthesis (tokens: Token[], index: number): [Expression, number] {
  index += 1;
  const [expression, currentIndex]: [Expression, number] = parseExpression(tokens, index, PrecedenceLevel.Lowest);
  if (expression.type === NodeType.IllegalExpression) {
    return [expression, currentIndex ];
  }
  if (tokens[currentIndex + 1].type === TokenType.RightParenthesis) {
    return [expression, currentIndex + 1];
  }
  return [
    createIllegalExpression({
      type: ErrorType.SyntaxError,
      message: `')' is missing.`,
      line: tokens[currentIndex].line,
      column: tokens[currentIndex].column + 1
    }),
    currentIndex
  ];
}

// Prefix
export function parsePrefixExpression (tokens: Token[], index: number): [Expression, number] {
  const prefixExpression: PrefixExpression = createPrefixExpression(tokens[index]);
  index += 1;
  const [rightExpression, currentIndex]: [Expression, number] = parseExpression(tokens, index, PrecedenceLevel.Prefix);
  if (rightExpression.type === NodeType.IllegalExpression) {
    const error = (rightExpression as IllegalExpression).error;
    return [
      createIllegalExpression({
        type: ErrorType.SyntaxError, // error.type,
        message: `incorrect expression after '${prefixExpression.operator}'.`, // `at parsePrefixExpression => ${error.message}`,
        line: error.line,
        column: error.column
      }),
      currentIndex
    ];
  }
  prefixExpression.right = rightExpression;
  return [prefixExpression, currentIndex];
}

// Infix
export function parseInfixExpression (tokens: Token[], index: number, expression: Expression): [Expression, number] {
  const infixExpression: InfixExpression = createInfixExpression(tokens[index]);
  infixExpression.left = expression;
  const precedence: PrecedenceLevel = currentPrecedence(tokens, index);
  index += 1;
  const [rightExpression, currentIndex]: [Expression, number] = parseExpression(tokens, index, precedence);
  if (rightExpression.type === NodeType.IllegalExpression) {
    const error = (rightExpression as IllegalExpression).error;
    return [
      createIllegalExpression({
        type: ErrorType.SyntaxError, // error.type,
        message: `incorrect expression after '${infixExpression.operator}'.`, // `at parseInfixExpression => ${error.message}`,
        line: error.line,
        column: error.column
      }),
      currentIndex
    ];
  }
  infixExpression.right = rightExpression;
  return [infixExpression, currentIndex];
}

// BlockStatement
export function parseBlockStatement (
  tokens: Token[],
  index: number,
  isTrue: (_tokens: Token[], _index: number) => boolean = (_tokens: Token[], _index: number): boolean => (_tokens[_index].type !== TokenType.End)
): [BlockStatement | IllegalStatement, number] {
  const blockStatement: BlockStatement = createBlockStatement(tokens[index]);
  index += 1;
  while (isTrue(tokens, index)) {
    if (tokens[index].type === TokenType.EOF) {
      return [
        createIllegalStatement({
          type: ErrorType.StatementError,
          message: `unterminated block statement.`,
          line: tokens[index].line,
          column: tokens[index].column
        }),
        index
      ];
    }
    const [statement, currentIndex]: [Statement, number] = parseStatement(tokens, index);
    if (statement.type === NodeType.IllegalStatement) {
      return [ statement as IllegalStatement, currentIndex ];
    }
    blockStatement.statements.push(statement);
    index = currentIndex + 1;
  }
  return [blockStatement, index];
}

// If
export function parseIfExpression (tokens: Token[], index: number): [Expression, number] {
  const ifExpression: IfExpression = createIfExpression(tokens[index]);
  index += 1;
  const condition: [Expression, number] = parseExpression(tokens, index, PrecedenceLevel.Lowest);
  index = condition[1];
  if (condition[0].type === NodeType.IllegalExpression) {
    return [ condition[0] as IllegalExpression, index ];
  }
  if (tokens[index + 1].type !== TokenType.Then) {
    return [
      createIllegalExpression({
        type: ErrorType.SyntaxError,
        message: `'Then' is expected.`,
        line: tokens[index + 1].line,
        column: tokens[index + 1].column
      }),
      index + 1
    ];
  }
  index += 1;
  const isTrue: (_tokens: Token[], _index: number) => boolean = (_tokens: Token[], _index: number): boolean => (_tokens[_index].type !== TokenType.Elsif && _tokens[_index].type !== TokenType.Else && _tokens[_index].type !== TokenType.End);
  const statement: [Statement, number] = parseBlockStatement(tokens, index, isTrue);
  index = statement[1];
  if (statement[0].type === NodeType.IllegalStatement) {
    return [ statement[0] as IllegalStatement, index ];
  }
  ifExpression.cases.push({
    condition: condition[0],
    statement: statement[0] as BlockStatement
  });
  // Elsif
  while (tokens[index].type === TokenType.Elsif) {
    index += 1;
    const elsifCondition: [Expression, number] = parseExpression(tokens, index, PrecedenceLevel.Lowest);
    if (elsifCondition[0].type === NodeType.IllegalExpression) {
      return elsifCondition;
    }
    index = elsifCondition[1];
    if (tokens[index + 1].type !== TokenType.Then) {
      return [
        createIllegalExpression({
          type: ErrorType.SyntaxError,
          message: `'Then' is expected.`,
          line: tokens[index + 1].line,
          column: tokens[index + 1].column
        }),
        index + 1
      ];
    }
    index += 1;
    const elsifStatement: [Statement, number] = parseBlockStatement(tokens, index, isTrue);
    if (elsifStatement[0].type === NodeType.IllegalStatement) {
      return elsifStatement;
    }
    index = elsifStatement[1];
    ifExpression.cases.push({
      condition: elsifCondition[0],
      statement: elsifStatement[0] as BlockStatement
    });
  }
  // Else
  if (tokens[index].type === TokenType.Else) {
    const elseStatement: [Statement, number] = parseBlockStatement(tokens, index, isTrue);
    index = elseStatement[1];
    if (elseStatement[0].type === NodeType.IllegalStatement) {
      return [ elseStatement[0], index ];
    }
    ifExpression.elseCase = elseStatement[0] as BlockStatement;
  }
  return [ifExpression, index];
}

// Repeat
export function parseRepeatExpression (tokens: Token[], index: number): [Expression, number] {
  const repeatExpression: RepeatExpression = createRepeatExpression(tokens[index]);
  index += 1;
  if (tokens[index].type !== TokenType.Identifier) {
    return [
      createIllegalExpression({
        type: ErrorType.SyntaxError,
        message: 'missing index variable.',
        line: tokens[index].line,
        column: tokens[index].column
      }),
      index
    ];
  }
  // index
  repeatExpression.index = createIdentifier(tokens[index]);
  // from
  index += 1;
  if (tokens[index].type !== TokenType.From) {
    return [
      createIllegalExpression({
        type: ErrorType.SyntaxError,
        message: `missing 'from'.`,
        line: tokens[index].line,
        column: tokens[index].column
      }),
      index
    ];
  }
  index += 1;
  const from: [Expression, number] = parseExpression(tokens, index, PrecedenceLevel.Lowest);
  index = from[1];
  if (from[0].type === NodeType.IllegalExpression) {
    return from;
  }
  repeatExpression.from = from[0];
  // to
  index += 1;
  if (tokens[index].type !== TokenType.To) {
    return [
      createIllegalExpression({
        type: ErrorType.SyntaxError,
        message: `missing 'to'.`,
        line: tokens[index].line,
        column: tokens[index].column
      }),
      index
    ];
  }
  index += 1;
  const to: [Expression, number] = parseExpression(tokens, index, PrecedenceLevel.Lowest);
  index = to[1];
  if (to[0].type === NodeType.IllegalExpression) {
    return to;
  }
  repeatExpression.to = to[0];
  // do
  index += 1;
  if (tokens[index].type !== TokenType.Do) {
    return [
      createIllegalExpression({
        type: ErrorType.SyntaxError,
        message: `missing 'do'.`,
        line: tokens[index].line,
        column: tokens[index].column
      }),
      index
    ];
  }
  const statement: [Statement, number] = parseBlockStatement(tokens, index);
  index = statement[1];
  if (statement[0].type === NodeType.IllegalStatement) {
    return statement;
  }
  repeatExpression.statement = statement[0] as BlockStatement;
  return [repeatExpression, index];
}

// Attribute
export function parseAttributeStatement (tokens: Token[], index: number): [Expression, number] {
  const attributeStatement: AttributeStatement = createAttributeStatement(tokens[index]);
  // attributeStatement.name = tokens[index].literal;
  index += 1;
  const [expression, currentIndex]: [Expression, number] = parseExpression(tokens, index, PrecedenceLevel.Lowest);
  if (expression.type === NodeType.IllegalExpression) {
    return [ expression as IllegalExpression, currentIndex ];
  }
  attributeStatement.value = expression;
  return [attributeStatement, currentIndex];
}

// Size
const availableAttributes: string[] = ['width', 'height'];

export function parseSizeExpression (tokens: Token[], index: number): [Expression, number] {
  const sizeExpression: SizeExpression = createSizeExpression(tokens[index]);
  // const tempIndex = index;
  while (tokens[index + 1].type === TokenType.Attribute) {
    index += 1;
    const literal = tokens[index].literal;
    if (availableAttributes.includes(literal)) {
      const [attributeStatement, currentIndex]: [Expression, number] = parseAttributeStatement(tokens, index);
      if (attributeStatement.type === NodeType.IllegalExpression) {
        return [ attributeStatement as IllegalExpression, currentIndex ];
      }
      (sizeExpression as { [key: string]: any })[literal] = attributeStatement as AttributeStatement;
      index = currentIndex;
    } else {
      return [
        createIllegalExpression({
          type: ErrorType.SyntaxError,
          message: `unknown attribute '${tokens[index].literal}' for 'size'.`,
          line: tokens[index].line,
          column: tokens[index].column
        }),
        index
      ];
    }
  }
  const statement: [Statement, number] = parseBlockStatement(tokens, index);
  if (statement[0].type === NodeType.IllegalStatement) {
    return statement;
  }
  index = statement[1];
  sizeExpression.statement = statement[0] as BlockStatement;
  // sizeExpression.statement.token = { ...tokens[tempIndex] };
  return [sizeExpression, index];
}

// Tag
export function parseTagExpression (tokens: Token[], index: number): [Expression, number] {
  const tagExpression: TagExpression = createTagExpression(tokens[index]);
  // const tempIndex = index;
  tagExpression.name = tokens[index].literal;
  while (tokens[index + 1].type === TokenType.Attribute) {
    index += 1;
    const [attributeStatement, currentIndex]: [Expression, number] = parseAttributeStatement(tokens, index);
    if (attributeStatement.type === NodeType.IllegalExpression) {
      return [ attributeStatement as IllegalExpression, currentIndex ];
    }
    tagExpression.attributes.push(attributeStatement as AttributeStatement);
    index = currentIndex;
  }
  const statement: [Statement, number] = parseBlockStatement(tokens, index);
  if (statement[0].type === NodeType.IllegalStatement) {
    return statement;
  }
  index = statement[1];
  tagExpression.statement = statement[0] as BlockStatement;
  // tagExpression.statement.token = { ...tokens[tempIndex] };
  return [tagExpression, index];
}

//
export function currentPrecedence (tokens: Token[], index: number): PrecedenceLevel {
  return precedences[tokens[index].type] || PrecedenceLevel.Lowest;
}

export function peekPrecedence (tokens: Token[], index: number): PrecedenceLevel {
  return precedences[tokens[index + 1].type] || PrecedenceLevel.Lowest;
}

export function parseExpression (tokens: Token[], index: number, precedence: PrecedenceLevel): [Expression, number] {
  const prefix: PrefixParseFn = prefixParseFns[tokens[index].type];
  if (!prefix) {
    return [
      createIllegalExpression({
        type: ErrorType.SyntaxError,
        message: `unknown prefix '${tokens[index].literal}'.`,
        line: tokens[index].line,
        column: tokens[index].column
      }),
      index
    ];
  }
  let [leftExp, currentIndex]: [Expression, number] = prefix(tokens, index);
  if (leftExp.type === NodeType.IllegalExpression) {
    return [ leftExp as IllegalExpression, currentIndex ];
  }
  while (currentIndex < tokens.length - 1 && precedence < peekPrecedence(tokens, currentIndex)) {
    // TODO: is semicolon check needed?
    const infix: InfixParseFn = infixParseFns[tokens[currentIndex + 1].type];
    if (!infix) {
      return [leftExp, currentIndex];
    }
    currentIndex += 1;
    [leftExp, currentIndex] = infix(tokens, currentIndex, leftExp);
    if (leftExp.type === NodeType.IllegalExpression) {
      return [ leftExp as IllegalExpression, currentIndex ];
    }
  }
  return [leftExp, currentIndex];
}

export function parseExpressionStatement (tokens: Token[], index: number): [ExpressionStatement | IllegalStatement, number] {
  const statement: ExpressionStatement = createExpressionStatement(tokens[index]);
  // tslint:disable-next-line: prefer-const
  let [expression, currentIndex]: [Expression, number] = parseExpression(tokens, index, PrecedenceLevel.Lowest);
  if (expression.type === NodeType.IllegalExpression) {
    return [
      createIllegalStatement((expression as IllegalExpression).error),
      currentIndex
    ];
  }
  statement.expression = expression as Expression;
  while (tokens[currentIndex + 1].type === TokenType.Semicolon) {
    currentIndex += 1;
  }
  return [statement, currentIndex];
}

// Set
export function parseSetStatement (tokens: Token[], index: number): [SetStatement | IllegalStatement, number] {
  if (tokens[index + 1].type !== TokenType.Identifier) {
    return [
      createIllegalStatement({
        type: ErrorType.SyntaxError,
        message: 'variable name is expected.',
        line: tokens[index + 1].line,
        column: tokens[index + 1].column
      }),
      index
    ];
  }
  const setStatement: SetStatement = createSetStatement(tokens[index]);
  index += 1;
  setStatement.name = createIdentifier(tokens[index]);
  index += 1;
  // tslint:disable-next-line: prefer-const
  let [expression, currentIndex]: [Expression, number] = parseExpression(tokens, index, PrecedenceLevel.Lowest);
  if (expression.type === NodeType.IllegalExpression) {
    return [
      createIllegalStatement((expression as IllegalExpression).error),
      currentIndex
    ];
  }
  setStatement.value = expression as Expression;
  while (tokens[currentIndex + 1].type === TokenType.Semicolon) {
    currentIndex += 1;
  }
  return [setStatement, currentIndex];
}

// Update
export function parseUpdateStatement (tokens: Token[], index: number): [UpdateStatement | IllegalStatement, number] {
  if (tokens[index + 1].type !== TokenType.Identifier) {
    return [
      createIllegalStatement({
        type: ErrorType.SyntaxError,
        message: `variable name is expected.`,
        line: tokens[index + 1].line,
        column: tokens[index + 1].column
      }),
      index
    ];
  }
  const updateStatement: UpdateStatement = createUpdateStatement(tokens[index]);
  index += 1;
  updateStatement.name = createIdentifier(tokens[index]);
  index += 1;
  // tslint:disable-next-line: prefer-const
  let [expression, currentIndex]: [Expression, number] = parseExpression(tokens, index, PrecedenceLevel.Lowest);
  if (expression.type === NodeType.IllegalExpression) {
    return [
      createIllegalStatement((expression as IllegalExpression).error),
      currentIndex
    ];
  }
  updateStatement.value = expression as Expression;
  while (tokens[currentIndex + 1].type === TokenType.Semicolon) {
    currentIndex += 1;
  }
  return [updateStatement, currentIndex];
}

export function parseStatement (tokens: Token[], index: number): [Statement, number] {
  if (tokens[index].type === TokenType.Set) {
    return parseSetStatement(tokens, index);
  }
  if (tokens[index].type === TokenType.Update) {
    return parseUpdateStatement(tokens, index);
  }
  return parseExpressionStatement(tokens, index);
}

export function parse (tokens: Token[]): [Program, ErrorInterface|null] {
  let index: number = 0;
  const program: Program = createProgram();

  while (index < tokens.length - 1) {
    const [statement, currentIndex]: [Statement, number] = parseStatement(tokens, index);
    if (statement.type === NodeType.IllegalStatement) {
      return [
        createProgram([]),
        (statement as IllegalStatement).error
      ];
    }
    if (statement) {
      program.statements.push(statement);
    }
    index = currentIndex + 1;
  }

  return [program, null];
}
