import {
  NodeType,
  SetStatement,
  SizeExpression,
  TagExpression
} from '../ast';
import { Context } from '../context';
import { ErrorType } from '../error';
import {
  evalAttributeStatement,
  evalBlockStatement,
  evalBooleanInfixExpression,
  evalIfExpression,
  evalInfixExpression,
  evalNumberInfixExpression,
  evalPrefixExpression,
  evalProgram,
  evalRepeatExpression,
  evalSetStatement,
  evalSizeExpression,
  evalTagExpression,
  evaluate,
  evalUpdateStatement
} from '../evaluate';
import { tokenize } from '../lexer';
import { ErrorObject, IntegerObject, ObjectType } from '../object';
import { parse } from '../parser';
import { Product } from '../product';
import { TokenType } from '../tokens';

describe('evalPrefixExpression', () => {
  it(`evaluates prefix expression 'not true' as 'false'`, () => {
    const input = {
      operator: 'not',
      right: { type: ObjectType.Boolean, value: true }
    };
    const result = { type: ObjectType.Boolean, value: false };
    expect(evalPrefixExpression(input.operator, input.right)).toEqual(result);
  });

  it(`evaluates prefix expression '-2' as '-2'`, () => {
    const input = {
      operator: '-',
      right: { type: ObjectType.Int, value: 2 }
    };
    const result = { type: ObjectType.Int, value: -2 };
    expect(evalPrefixExpression(input.operator, input.right)).toEqual(result);
  });

  it('returns TypeError for wrong type (- true)', () => {
    const input = {
      operator: '-',
      right: { type: ObjectType.Boolean, value: true }
    };
    const result = {
      type: ObjectType.Error,
      value: {
        type: ErrorType.TypeError,
        message: `Wrong type to have '-'. Please use integer or float type.`
      }
    };
    expect(evalPrefixExpression(input.operator, input.right)).toEqual(result);
  });

  it('returns SyntaxError for unknown operator', () => {
    const input = {
      operator: '$',
      right: { type: ObjectType.Boolean, value: true }
    };
    const result = {
      type: ObjectType.Error,
      value: {
        type: ErrorType.SyntaxError,
        message: 'Unknown prefix operator.'
      }
    };
    expect(evalPrefixExpression(input.operator, input.right)).toEqual(result);
  });
});

describe('evalNumberInfixExpression', () => {
  describe('evaluates numeric infix expressions', () => {
    const left = { type: ObjectType.Int, value: 1 };
    const right = { type: ObjectType.Int, value: 2 };
    const operators = ['+', '-', '*', '/', '**', '%'];
    const results = [
      { type: ObjectType.Int, value: 3 },
      { type: ObjectType.Int, value: -1 },
      { type: ObjectType.Int, value: 2 },
      { type: ObjectType.Int, value: 0 },
      { type: ObjectType.Int, value: 1 },
      { type: ObjectType.Int, value: 1 }
    ];

    for (let [i, operator] of operators.entries()) {
      it(`operator '${operator}' returns number`, () => {
        expect(evalNumberInfixExpression(operator, left, right)).toEqual(results[i]);
      });
    }
  });

  describe('evaluates comparison infix expressions', () => {
    const left = { type: ObjectType.Int, value: 1 };
    const right = { type: ObjectType.Int, value: 2 };
    const operators = ['>', '>=', '<', '<=', '==', '!='];
    const results = [
      { type: ObjectType.Boolean, value: false },
      { type: ObjectType.Boolean, value: false },
      { type: ObjectType.Boolean, value: true },
      { type: ObjectType.Boolean, value: true },
      { type: ObjectType.Boolean, value: false },
      { type: ObjectType.Boolean, value: true }
    ];

    for (let [i, operator] of operators.entries()) {
      it(`operator '${operator}' returns boolean`, () => {
        expect(evalNumberInfixExpression(operator, left, right)).toEqual(results[i]);
      });
    }
  });

  it('returns if unknown operator is passed', () => {
    const operator = '$';
    const left = { type: ObjectType.Int, value: 1 };
    const right = { type: ObjectType.Int, value: 2 };
    const result = evalNumberInfixExpression(operator, left, right);
    expect(result.type).toEqual(ObjectType.Error);
    expect((result as ErrorObject).value.type).toEqual(ErrorType.SyntaxError);
  });
});

describe('evalBooleanInfixExpression', () => {
  describe('evaluates boolean infix expression', () => {
    const left = { type: ObjectType.Boolean, value: true };
    const right = { type: ObjectType.Boolean, value: false };
    const operators = ['and', 'or', '==', '!='];
    const results = [
      { type: ObjectType.Boolean, value: false },
      { type: ObjectType.Boolean, value: true },
      { type: ObjectType.Boolean, value: false },
      { type: ObjectType.Boolean, value: true }
    ];

    for (let [i, operator] of operators.entries()) {
      it(`operator '${operator}' returns boolean`, () => {
        expect(evalBooleanInfixExpression(operator, left, right)).toEqual(results[i]);
      });
    }
  });

  it('returns if unknown operator is passed', () => {
    const operator = '$';
    const left = { type: ObjectType.Boolean, value: true };
    const right = { type: ObjectType.Boolean, value: false };
    const result = evalBooleanInfixExpression(operator, left, right);
    expect(result.type).toEqual(ObjectType.Error);
    expect((result as ErrorObject).value.type).toEqual(ErrorType.SyntaxError);
  });
});

describe('evalInfixExpression', () => {
  describe('evaluates infix expressions with numbers', () => {
    describe('calculations', () => {
      const left = { type: ObjectType.Int, value: 2 };
      const right = { type: ObjectType.Int, value: 1 };
      const operators = ['+', '-', '*', '/', '**', '%'];
      const results = [
        { type: ObjectType.Int, value: 3 },
        { type: ObjectType.Int, value: 1 },
        { type: ObjectType.Int, value: 2 },
        { type: ObjectType.Int, value: 2 },
        { type: ObjectType.Int, value: 2 },
        { type: ObjectType.Int, value: 0 }
      ];

      for (let [i, operator] of operators.entries()) {
        it(`operator '${operator}' returns number`, () => {
          expect(evalInfixExpression(operator, left, right)).toEqual(results[i]);
        });
      }
    });

    describe('comparisons', () => {
      const left = { type: ObjectType.Int, value: 1 };
      const right = { type: ObjectType.Int, value: 1 };
      const operators = ['>', '>=', '<', '<=', '==', '!='];
      const results = [
        { type: ObjectType.Boolean, value: false },
        { type: ObjectType.Boolean, value: true },
        { type: ObjectType.Boolean, value: false },
        { type: ObjectType.Boolean, value: true },
        { type: ObjectType.Boolean, value: true },
        { type: ObjectType.Boolean, value: false }
      ];

      for (let [i, operator] of operators.entries()) {
        it(`operator '${operator}' returns boolean`, () => {
          expect(evalInfixExpression(operator, left, right)).toEqual(results[i]);
        });
      }
    });
  });

  describe('evaluates infix expressions with booleans', () => {
    const left = { type: ObjectType.Boolean, value: true };
    const right = { type: ObjectType.Boolean, value: true };
    const operators = ['and', 'or', '==', '!='];
    const results = [
      { type: ObjectType.Boolean, value: true },
      { type: ObjectType.Boolean, value: true },
      { type: ObjectType.Boolean, value: true },
      { type: ObjectType.Boolean, value: false }
    ];

    for (let [i, operator] of operators.entries()) {
      it(`operator '${operator}' returns boolean`, () => {
        expect(evalInfixExpression(operator, left, right)).toEqual(results[i]);
      });
    }
  });

  describe('returns error', () => {
    it(`if left and right types don't match`, () => {
      const operator = '+';
      const left = { type: ObjectType.Int, value: 1 };
      const right = { type: ObjectType.Boolean, value: false };
      const result = evalInfixExpression(operator, left, right);
      expect(result.type).toEqual(ObjectType.Error);
      expect((result as ErrorObject).value.type).toEqual(ErrorType.TypeError);
    });

    it('if unknown operator is passed', () => {
      const operator = '$';
      const left = { type: ObjectType.Boolean, value: true };
      const right = { type: ObjectType.Boolean, value: false };
      const result = evalInfixExpression(operator, left, right);
      expect(result.type).toEqual(ObjectType.Error);
      expect((result as ErrorObject).value.type).toEqual(ErrorType.SyntaxError);
    });
  });
});

describe('evalBlockStatement', () => {
  describe('evaluates block statement', () => {
    let context: Context;
    let product: Product;

    beforeEach(() => {
      context = { parent: null, symbols: {} };
      product = { size: '', grid: [], currentScope: '' };
    });

    it(`can be a single line like 'then 1 end'`, () => {
      const input = {
        type: NodeType.BlockStatement,
        token: { type: TokenType.Then, literal: 'then', column: 1, line: 1 },
        statements: [
          {
            type: NodeType.ExpressionStatement,
            token: { type: TokenType.Int, literal: '1', column: 6, line: 1 },
            expression: {
              type: NodeType.Integer,
              token: { type: TokenType.Int, literal: '1', column: 6, line: 1 },
              value: 1
            }
          }
        ]
      };
      const result = [
        { type: ObjectType.Int, value: 1 },
        { parent: null, symbols: {} },
        { size: '', grid: [], currentScope: '' }
      ];
      expect(evalBlockStatement(input, context, product)).toEqual(result);
    });

    it(`can be multiple lines like 'then 1; 2 end'`, () => {
      const input = {
        type: NodeType.BlockStatement,
        token: { type: TokenType.Then, literal: 'then', column: 1, line: 1 },
        statements: [
          {
            type: NodeType.ExpressionStatement,
            token: { type: TokenType.Int, literal: '1', column: 6, line: 1 },
            expression: {
              type: NodeType.Integer,
              token: { type: TokenType.Int, literal: '1', column: 6, line: 1 },
              value: 1
            }
          },
          {
            type: NodeType.ExpressionStatement,
            token: { type: TokenType.Int, literal: '2', column: 9, line: 1 },
            expression: {
              type: NodeType.Integer,
              token: { type: TokenType.Int, literal: '2', column: 9, line: 1 },
              value: 2
            }
          }
        ]
      };
      const result = [
        { type: ObjectType.Int, value: 2 },
        { parent: null, symbols: {} },
        { size: '', grid: [], currentScope: '' }
      ];
      expect(evalBlockStatement(input, context, product)).toEqual(result);
    });
  });
});

describe('evalIfExpression', () => {
  let context: Context;
  let product: Product;

  beforeEach(() => {
    context = { parent: null, symbols: {} };
    product = { size: '', grid: [], currentScope: '' };
  });

  it('evaluates if statement', () => {
    const input = 'if true then 1 end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 1 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalIfExpression((nodes.statements[0] as any).expression, context, product)).toEqual(result);
  });

  it('evaluates if else statement', () => {
    const input = 'if false then 1 else 2 end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 2 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalIfExpression((nodes.statements[0] as any).expression, context, product)).toEqual(result);
  });

  it('evaluates if elsif statement', () => {
    const input = 'if false then 1 elsif true then 2 end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 2 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalIfExpression((nodes.statements[0] as any).expression, context, product)).toEqual(result);
  });

  it('evaluates if elsif else statement', () => {
    const input = 'if false then 1 elsif false then 2 else end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Null, value: null },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalIfExpression((nodes.statements[0] as any).expression, context, product)).toEqual(result);
  });

  it('has scoped context', () => {
    const input = `
      if true then
        set a 1
        if false then
          set a 2;
          a
        else
          set a 3;
          a
        end
      end
    `;
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 3 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalIfExpression((nodes.statements[0] as any).expression, context, product)).toEqual(result);
  });

  it(`returns error if condition is not boolean`, () => {
    const input = 'if 1 then 1 end';
    const [tokens, _] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result = evalIfExpression((nodes.statements[0] as any).expression, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.TypeError);
    expect((result[0] as ErrorObject).value.column).toBe(4);
  });
});

describe('evalRepeatExpression', () => {
  let context: Context;
  let product: Product;

  beforeEach(() => {
    context = { parent: null, symbols: {} };
    product = { size: '', grid: [], currentScope: '' };
  });

  it('evaluates repeat statement', () => {
    const input = 'repeat i from 0 to 10 do i end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 9 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalRepeatExpression((nodes.statements[0] as any).expression, context, product)).toEqual(result);
  });

  it('returns error if index is not set', () => {
    // repeat from 0 to 10 do end
    const input = {
      type: NodeType.RepeatExpression,
      token: { type: TokenType.Repeat, literal: 'repeat', column: 1, line: 1 },
      index: null,
      from: {
        type: NodeType.Integer,
        token: { type: TokenType.Int, literal: '0', column: 13, line: 1 },
        value: 0
      },
      to: {
        type: NodeType.Integer,
        token: { type: TokenType.Int, literal: '10', column: 18, line: 1 },
        value: 10
      },
      statement: {
        type: NodeType.BlockStatement,
        token: { type: TokenType.Do, literal: 'do', column: 21, line: 1 },
        statements: []
      }
    };
    const result = evalRepeatExpression(input, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as ErrorObject).value.column).toBe(1);
  });

  it(`returns error if invalid value for 'from' is set.`, () => {
    // repeat i from true to 10 do end
    const input = {
      type: NodeType.RepeatExpression,
      token: { type: TokenType.Repeat, literal: 'repeat', column: 1, line: 1 },
      index: {
        type: NodeType.Identifier,
        token: { type: TokenType.Identifier, literal: 'i', column: 8, line: 1 },
        value: 'i'
      },
      from:  {
        type: NodeType.Boolean,
        token: { type: TokenType.True, literal: 'true', column: 15, line: 1 },
        value: true
      },
      to: {
        type: NodeType.Integer,
        token: { type: TokenType.Int, literal: '10', column: 23, line: 1 },
        value: 10
      },
      statement: {
        type: NodeType.BlockStatement,
        token: { type: TokenType.Do, literal: 'do', column: 26, line: 1 },
        statements: []
      }
    };
    const result = evalRepeatExpression(input, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.TypeError);
    expect((result[0] as ErrorObject).value.column).toBe(15);
  });

  it(`returns error if invalid value for 'to' is set.`, () => {
    // repeat i from 0 to true do end
    const input = {
      type: NodeType.RepeatExpression,
      token: { type: TokenType.Repeat, literal: 'repeat', column: 1, line: 1 },
      index: {
        type: NodeType.Identifier,
        token: { type: TokenType.Identifier, literal: 'i', column: 8, line: 1 },
        value: 'i'
      },
      from:  {
        type: NodeType.Integer,
        token: { type: TokenType.Int, literal: '0', column: 15, line: 1 },
        value: 10
      },
      to: {
        type: NodeType.Boolean,
        token: { type: TokenType.True, literal: 'true', column: 20, line: 1 },
        value: true
      },
      statement: {
        type: NodeType.BlockStatement,
        token: { type: TokenType.Do, literal: 'do', column: 25, line: 1 },
        statements: []
      }
    };
    const result = evalRepeatExpression(input, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.TypeError);
    expect((result[0] as ErrorObject).value.column).toBe(20);
  });

  it('has scoped context', () => {
    const input = `
      repeat x from 0 to 5 do
        set a x

        repeat y from 10 to 15 do
          set a y
        end

        a
      end
    `;
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 4 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalRepeatExpression((nodes.statements[0] as any).expression, context, product)).toEqual(result);
  });
});

describe('evalSetStatement', () => {
  let context: Context;
  let product: Product;

  beforeEach(() => {
    context = { parent: null, symbols: {} };
    product = { size: '', grid: [], currentScope: '' };
  });

  it('evaluates set statement to assign values to variables', () => {
    const input = 'set a 10';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 10 },
      {
        parent: null,
        symbols: {
          a: { type: ObjectType.Int, value: 10 }
        }
      },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalSetStatement(nodes.statements[0] as SetStatement, context, product)).toEqual(result);
  });

  it('returns error if variable is not set', () => {
    // set 10
    const input = {
      type: NodeType.SetStatement,
      token: { type: TokenType.Set, literal: 'set', column: 1, line: 1 },
      name: null,
      value: {
        type: NodeType.Integer,
        token: { type: TokenType.Int, literal: '10', column: 7, line: 1 },
        value: 10
      }
    };
    const result = evalSetStatement(input, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as ErrorObject).value.column).toBe(1);
  });
});

describe('evalUpdateStatement', () => {
  let context: Context;
  let product: Product;

  beforeEach(() => {
    context = {
      parent: null,
      symbols: {
        a: { type: ObjectType.Int, value: 0 } as IntegerObject
      }
    };
    product = { size: '', grid: [], currentScope: '' };
  });

  it('evaluates update statement to update values of variables', () => {
    const input = 'update a 10';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 10 },
      {
        parent: null,
        symbols: {
          a: { type: ObjectType.Int, value: 10 }
        }
      },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalUpdateStatement(nodes.statements[0] as SetStatement, context as Context, product)).toEqual(result);
  });

  it('returns error if variable is not set', () => {
    // update 10
    const input = {
      type: NodeType.UpdateStatement,
      token: { type: TokenType.Update, literal: 'update', column: 1, line: 1 },
      name: null,
      value: {
        type: NodeType.Integer,
        token: { type: TokenType.Int, literal: '10', column: 7, line: 1 },
        value: 10
      }
    };
    const result = evalUpdateStatement(input, context as Context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as ErrorObject).value.column).toBe(1);
  });

  it('returns error if variable is not previously declared', () => {
    context = { parent: null, symbols: {} };
    const input = 'update a 10';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  evalUpdateStatement(nodes.statements[0] as SetStatement, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.UndeclaredVariableError);
    expect((result[0] as ErrorObject).value.column).toBe(8);
  });
});

describe('evalAttributeStatement', () => {
  let context: Context;
  let product: Product;

  beforeEach(() => {
    context = { parent: null, symbols: {} };
    product = { size: '', grid: [], currentScope: '' };
  });

  it('evaluate attributes', () => {
    const input = {
      type: NodeType.Attribute,
      token: { type: TokenType.Attribute, literal: 'width', column: 1, line: 1 },
      name: { type: NodeType.Identifier, token: { type: TokenType.Attribute, literal: 'width', column: 1, line: 1 }, value: 'width' },
      value: { type: NodeType.Integer, token: { type: TokenType.Int, literal: '200', column: 7, line: 1 }, value: 200 }
    };
    const result =  [
      { type: ObjectType.Attribute, key: 'width', value: 200 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalAttributeStatement(input, context, product)).toEqual(result);
  });

  it('returns error if attribute value is not number', () => {
    const input = {
      type: NodeType.Attribute,
      token: { type: TokenType.Attribute, literal: 'width', column: 1, line: 1 },
      name: { type: NodeType.Identifier, token: { type: TokenType.Attribute, literal: 'width', column: 1, line: 1 }, value: 'width' },
      value: { type: NodeType.Boolean, token: { type: TokenType.True, literal: 'true', column: 7, line: 1 }, value: true }
    };
    const result = evalAttributeStatement(input, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.TypeError);
    expect((result[0] as ErrorObject).value.column).toBe(7);
  });
});

describe('evalSizeExpression', () => {
  let context: Context;
  let product: Product;

  beforeEach(() => {
    context = { parent: null, symbols: {} };
    product = { size: '', grid: [], currentScope: '' };
  });

  it('evaluate size expression', () => {
    const input = 'size width 200 height 200 end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Null, value: null },
      { parent: null, symbols: {} },
      { size: 'id size, width 200, height 200', grid: [], currentScope: 'size' }
    ];
    expect(evalSizeExpression((nodes.statements[0] as any).expression as SizeExpression, context, product)).toEqual(result);
  });

  it('accepts block statements inside', () => {
    const input = `
      size width 200 height 200
        1 + 1
      end
    `;
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 2 },
      { parent: null, symbols: {} },
      { size: 'id size, width 200, height 200', grid: [], currentScope: 'size' }
    ];
    expect(evalSizeExpression((nodes.statements[0] as any).expression as SizeExpression, context, product)).toEqual(result);
  });

  it(`returns error if 'width' attribute is missing`, () => {
    const input = 'size height 200 end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  evalSizeExpression((nodes.statements[0] as any).expression as SizeExpression, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as ErrorObject).value.column).toBe(1);
  });

  it(`returns error if 'height' attribute is missing`, () => {
    const input = 'size width 200 end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  evalSizeExpression((nodes.statements[0] as any).expression as SizeExpression, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as ErrorObject).value.column).toBe(1);
  });

  it(`returns error if 'size' is nested`, () => {
    const input =
      `size width 200 height 200
          size width 50 height 50
          end
        end`;
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  evalSizeExpression((nodes.statements[0] as any).expression as SizeExpression, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as ErrorObject).value.line).toBe(2);
  });
});

describe('evalTagExpression', () => {
  let context: Context;
  let product: Product;

  beforeEach(() => {
    context = { parent: null, symbols: {} };
    product = { size: 'id size, width 200, height 200', grid: [], currentScope: 'size' };
  });

  it(`evaluates tag expressions inside 'size' expression`, () => {
    const input = 'group end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Null, value: null },
      { parent: null, symbols: {} },
      { size: 'id size, width 200, height 200', grid: ['id 0, parent size, tag group'], currentScope: 'size' }
    ];
    expect(evalTagExpression((nodes.statements[0] as any).expression as TagExpression, context, product)).toEqual(result);
  });

  it('evaluates tag expressions with attributes', () => {
    const input = 'group rotate 45 end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Null, value: null },
      { parent: null, symbols: {} },
      { size: 'id size, width 200, height 200', grid: ['id 0, parent size, tag group, rotate 45'], currentScope: 'size' }
    ];
    expect(evalTagExpression((nodes.statements[0] as any).expression as TagExpression, context, product)).toEqual(result);
  });

  it(`accepts block statement inside 'group'`, () => {
    const input = `
      group
        rotate 45

        1 + 1
      end
    `;
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 2 },
      { parent: null, symbols: {} },
      { size: 'id size, width 200, height 200', grid: ['id 0, parent size, tag group, rotate 45'], currentScope: 'size' }
    ];
    expect(evalTagExpression((nodes.statements[0] as any).expression as TagExpression, context, product)).toEqual(result);
  });

  it(`returns error if block statement is passed inside 'rectangle'`, () => {
    const input = `
      rectangle
        rotate 45

        1 + 1
      end
    `;
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result = evalTagExpression((nodes.statements[0] as any).expression as TagExpression, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
    expect((result[0] as ErrorObject).value.type).toBe(ErrorType.SyntaxError);
  });

  it(`returns error if it's not inside 'size' expression`, () => {
    product = { size: '', grid: [], currentScope: '' };
    const input = 'group end';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result = evalTagExpression((nodes.statements[0] as any).expression as TagExpression, context, product);
    expect(result[0].type).toBe(ObjectType.Error);
  });
});

describe('evalProgram', () => {
  let context: Context;
  let product: Product;

  beforeEach(() => {
    context = { parent: null, symbols: {} };
    product = { size: '', grid: [], currentScope: '' };
  });

  it('evaluates program', () => {
    const input = {
      type: NodeType.Program,
      statements: []
    };
    const result =  [
      { type: ObjectType.Null, value: null },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalProgram(input, context, product)).toEqual(result);
  });

  it('evaluates program with statements', () => {
    const input = '1; 2; 3';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 3 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evalProgram(nodes, context, product)).toEqual(result);
  });
});

// TODO: more test cases
describe('evaluate', () => {
  let context: Context;
  let product: Product;

  beforeEach(() => {
    context = { parent: null, symbols: {} };
    product = { size: '', grid: [], currentScope: '' };
  });

  it('evaluates integer node', () => {
    const input = {
      type: NodeType.Integer,
      token: { type: TokenType.Int, literal: '1', column: 1, line: 1 },
      value: 1
    };
    const result =  [
      { type: ObjectType.Int, value: 1 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evaluate(input)).toEqual(result);
  });

  it('evaluates float node', () => {
    const input = {
      type: NodeType.Float,
      token: { type: TokenType.Float, literal: '1.1', column: 1, line: 1 },
      value: 1.1
    };
    const result =  [
      { type: ObjectType.Float, value: 1.1 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evaluate(input)).toEqual(result);
  });

  it('evaluates boolean node', () => {
    const input = {
      type: NodeType.Boolean,
      token: { type: TokenType.True, literal: 'true', column: 1, line: 1 },
      value: true
    };
    const result =  [
      { type: ObjectType.Boolean, value: true },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evaluate(input)).toEqual(result);
  });

  it('evaluates prefix expression node', () => {
    const input = 'not true';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Boolean, value: false },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evaluate(nodes)).toEqual(result);
  });

  it('evaluates infix expression node', () => {
    const input = '1 + 1';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result =  [
      { type: ObjectType.Int, value: 2 },
      { parent: null, symbols: {} },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evaluate(nodes)).toEqual(result);
  });

  it('evaluates identifier', () => {
    context = {
      parent: null,
      symbols: {
        a: { type: ObjectType.Int, value: 2 } as IntegerObject
      }
    };
    const input = 'a';
    const [tokens, tokenError] = tokenize(input);
    const [nodes, parseError] = parse(tokens);
    const result = [
      { type: ObjectType.Int, value: 2 },
      { parent: null, symbols: { a: { type: ObjectType.Int, value: 2 } } },
      { size: '', grid: [], currentScope: '' }
    ];
    expect(evaluate((nodes.statements[0] as any).expression as TagExpression, context, product)).toEqual(result);
  });
});
