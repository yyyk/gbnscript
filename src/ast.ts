import { ErrorInterface } from './error';
import { Token, TokenType } from './tokens';

export enum NodeType {
  Node = 'Node',

  Statement = 'Statement',
  Expression = 'Expression',
  Program = 'Program',

  IllegalStatement = 'IllegalStatement',
  IllegalExpression = 'IllegalExpression',

  ExpressionStatement = 'ExpressionStatement',
  SetStatement = 'SetStatement',
  UpdateStatement = 'UpdateStatement',
  BlockStatement = 'BlockStatement',

  // AssignStatement,

  Identifier = 'Identifier',
  Integer = 'IntegerLiteral',
  Float = 'FloatLiteral',
  Boolean = 'BooleanLiteral',

  PrefixExpression = 'PrefixExpression',
  InfixExpression = 'InfixExpression',

  IfExpression = 'IfExpression',

  RepeatExpression = 'RepeatExpression',

  SizeExpression = 'SizeExpression',
  TagExpression = 'TagExpression',
  Attribute = 'AttributeStatement'
}

// Node, Statement, Expression, Program

export interface Node {
  readonly type: NodeType;
  token?: Token;
}

export type Statement = Node;
export type Expression = Node;

export interface Program extends Node {
  statements: Statement[];
}

// export function createNode (): Node {
//   return { type: NodeType.Node };
// }

// export function createStatement (): Statement {
//   return { type: NodeType.Statement };
// }

// export function createExpression (): Expression {
//   return { type: NodeType.Expression };
// }

export function createProgram (statements: Statement[] = []): Program {
  return {
    type: NodeType.Program,
    statements
  };
}

// IllegalStatement & IllegalExpression

export interface IllegalStatement extends Statement {
  error: ErrorInterface;
}

export function createIllegalStatement (error: ErrorInterface): IllegalStatement {
  return {
    type: NodeType.IllegalStatement,
    error
  };
}

export interface IllegalExpression extends Statement {
  error: ErrorInterface;
}

export function createIllegalExpression (error: ErrorInterface): IllegalExpression {
  return {
    type: NodeType.IllegalExpression,
    error
  };
}

// Identifier

export interface Identifier extends Expression {
  token: Token;
  value: string;
}

export function createIdentifier (token: Token = {} as Token): Identifier {
  return {
    type: NodeType.Identifier,
    token: { ...token },
    value: token.literal
  };
}

// Statements

export interface ExpressionStatement extends Statement {
  token: Token;
  expression: Expression | null;
}

export function createExpressionStatement (token: Token = {} as Token): ExpressionStatement {
  return {
    type: NodeType.ExpressionStatement,
    token: { ...token },
    expression: null
  };
}

export interface SetStatement extends Statement {
  token: Token;
  name: Identifier | null;
  value: Expression | null;
}

export function createSetStatement (token: Token = {} as Token): SetStatement {
  return {
    type: NodeType.SetStatement,
    token: { ...token },
    name: null,
    value: null
  };
}

export interface UpdateStatement extends Statement {
  token: Token;
  name: Identifier | null;
  value: Expression | null;
}

export function createUpdateStatement (token: Token = {} as Token): UpdateStatement {
  return {
    type: NodeType.UpdateStatement,
    token: { ...token },
    name: null,
    value: null
  };
}

export interface BlockStatement extends Statement {
  token: Token;
  statements: Statement[];
}

export function createBlockStatement (token: Token = {} as Token): BlockStatement {
  return {
    type: NodeType.BlockStatement,
    token: { ...token },
    statements: []
  };
}

// Expressions

// IntegerLiteral, FloatLiteral, BooleanLiteral

export interface IntegerLiteral extends Expression {
  token: Token;
  value: number;
}

export function createIntegerLiteral (token: Token = {} as Token): IntegerLiteral {
  return {
    type: NodeType.Integer,
    token: { ...token },
    value: Number(token.literal)
  };
}

export interface FloatLiteral extends Expression {
  token: Token;
  value: number;
}

export function createFloatLiteral (token: Token = {} as Token): FloatLiteral {
  return {
    type: NodeType.Float,
    token: { ...token },
    value: Number(token.literal)
  };
}

export interface BooleanLiteral extends Expression {
  token: Token;
  value: boolean;
}

export function createBooleanLiteral (token: Token = {} as Token): BooleanLiteral {
  return {
    type: NodeType.Boolean,
    token: { ...token },
    value: token.type === TokenType.True
  };
}

// PrefixExpression, InfixExpression

export interface PrefixExpression extends Expression {
  token: Token;
  operator: string;
  right: Expression | null;
}

export function createPrefixExpression (token: Token = {} as Token): PrefixExpression {
  return {
    type: NodeType.PrefixExpression,
    token: { ...token },
    operator: token.literal,
    right: null
  };
}

export interface InfixExpression extends Expression {
  token: Token;
  operator: string;
  left: Expression | null;
  right: Expression | null;
}

export function createInfixExpression (token: Token = {} as Token): InfixExpression {
  return {
    type: NodeType.InfixExpression,
    token: { ...token },
    operator: token.literal,
    left: null,
    right: null
  };
}

// IfExpression

export interface IfExpression extends Expression {
  token: Token;
  cases: Array<{ condition: Expression, statement: BlockStatement | null }>;
  elseCase: BlockStatement | null;
}

export function createIfExpression (token: Token = {} as Token): IfExpression {
  return {
    type: NodeType.IfExpression,
    token: { ...token },
    cases: [],
    elseCase: null
  };
}

// RepeatExpression

export interface RepeatExpression extends Expression {
  token: Token;
  index: Identifier | null;
  from: Expression | null;
  to: Expression | null;
  statement: BlockStatement | null;
}

export function createRepeatExpression (token: Token = {} as Token): RepeatExpression {
  return {
    type: NodeType.RepeatExpression,
    token: { ...token },
    index: null,
    from: null,
    to: null,
    statement: null
  };
}

// SizeExpression

export interface SizeExpression extends Expression {
  token: Token;
  width: AttributeStatement | null;
  height: AttributeStatement | null;
  statement: BlockStatement | null;
}

export function createSizeExpression (token: Token = {} as Token): SizeExpression {
  return {
    type: NodeType.SizeExpression,
    token: { ...token },
    width: null,
    height: null,
    statement: null
  };
}

// TagExpression

export interface TagExpression extends Expression {
  token: Token;
  name: string;
  attributes: AttributeStatement[];
  statement: BlockStatement | null;
}

export function createTagExpression (token: Token = {} as Token): TagExpression {
  return {
    type: NodeType.TagExpression,
    token: { ...token },
    name: '',
    attributes: [],
    statement: null
  };
}

// AttributeStatement

export interface AttributeStatement extends Expression {
  token: Token;
  name: Identifier;
  value: Expression | null;
}

export function createAttributeStatement (token: Token = {} as Token): AttributeStatement {
  return {
    type: NodeType.Attribute,
    token: { ...token },
    name: createIdentifier(token),
    value: null
  };
}
