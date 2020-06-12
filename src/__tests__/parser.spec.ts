import {
  IllegalExpression,
  IllegalStatement,
  NodeType
} from '../ast';
import { ErrorType } from '../error';
import { tokenize } from '../lexer';
import {
  parse,
  parseAttributeStatement,
  parseBlockStatement,
  parseBooleanLiteral,
  parseExpression,
  parseExpressionStatement,
  parseIfExpression,
  parseInfixExpression,
  parseLeftParenthesis,
  parsePrefixExpression,
  parseRepeatExpression,
  parseSetStatement,
  parseSizeExpression,
  parseStatement,
  parseTagExpression,
  parseUpdateStatement
} from '../parser';
import { PrecedenceLevel } from '../precedence';
import { Token, TokenType } from '../tokens';

describe('parseBooleanLiteral', () => {
  it('parses boolean literal', () => {
    const input: [Token[], number] = [
      [{ type: TokenType.True, literal: 'true', column: 1, line: 1 }],
      0
    ];
    const result = [
      {
        type: NodeType.Boolean,
        token: { type: TokenType.True, literal: 'true', column: 1, line: 1 },
        value: true
      },
      0
    ];
    expect(parseBooleanLiteral(input[0], input[1])).toEqual(result);
  });
});

describe('parseLeftParenthesis', () => {
  it('parses value inside ( and )', () => {
    const input: [Token[], number] = [
      [
        { type: TokenType.LeftParenthesis, literal: '(', column: 1, line: 1 },
        { type: TokenType.Int, literal: '2', column: 3, line: 1 },
        { type: TokenType.RightParenthesis, literal: ')', column: 5, line: 1 }
      ],
      0
    ];
    const result = [
      {
        type: NodeType.Integer,
        token: { type: TokenType.Int, literal: '2', column: 3, line: 1 },
        value: 2
      },
      2
    ];
    expect(parseLeftParenthesis(input[0], input[1])).toEqual(result);
  });

  it('returns SyntaxError if ) is not found', () => {
    const input: [Token[], number] = [
      [
        { type: TokenType.LeftParenthesis, literal: '(', column: 1, line: 1 },
        { type: TokenType.Int, literal: '2', column: 3, line: 1 },
        { type: TokenType.EOF, literal: '', column: 4, line: 1 }
      ],
      0
    ];
    const result = [
      {
        type: NodeType.IllegalExpression,
        error: {
          type: ErrorType.SyntaxError,
          message: `')' is missing.`,
          line: 1,
          column: 4
        }
      },
      1
    ];
    expect(parseLeftParenthesis(input[0], input[1])).toEqual(result);
  });
});

describe('parsePrefixExpression', () => {
  it('parses prefix operation', () => {
    const input = 'not true';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.PrefixExpression,
        token: { type: TokenType.Not, literal: 'not', column: 1, line: 1 },
        operator: 'not',
        right: {
          type: NodeType.Boolean,
          token: { type: TokenType.True, literal: 'true', column: 5, line: 1 },
          value: true
        }
      },
      1
    ];
    expect(parsePrefixExpression(tokens, 0)).toEqual(result);
  });

  it('returns IllegalExpression when right expression fails parsing', () => {
    const input = '- ';
    const [tokens, _] = tokenize(input);
    const result = parsePrefixExpression(tokens, 0);

    expect(result[0].type).toBe(NodeType.IllegalExpression);
    expect((result[0] as IllegalExpression).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalExpression).error.column).toBe(3);
  });
});

describe('parseInfixExpression', () => {
  it('parses infix operation', () => {
    const input = '1 + 1 ';
    const [tokens, _] = tokenize(input);
    const leftExpression = {
      type: NodeType.Integer,
      token: { type: TokenType.Int, literal: '1', column: 1, line: 1 },
      value: 1
    };
    const result = [
      {
        type: NodeType.InfixExpression,
        token: { type: TokenType.Plus, literal: '+', column: 3, line: 1 },
        operator: '+',
        left: {
          type: NodeType.Integer,
          token: { type: TokenType.Int, literal: '1', column: 1, line: 1 },
          value: 1
        },
        right: {
          type: NodeType.Integer,
          token: { type: TokenType.Int, literal: '1', column: 5, line: 1 },
          value: 1
        }
      },
      2
    ];
    expect(parseInfixExpression(tokens, 1, leftExpression)).toEqual(result);
  });

  it('returns IllegalExpression when right expression fails parsing', () => {
    const input = '1 - ';
    const [tokens, _] = tokenize(input);
    const leftExpression = {
      type: NodeType.Integer,
      token: { type: TokenType.Int, literal: '1', column: 1, line: 1 },
      value: 1
    };
    const result = parseInfixExpression(tokens, 0, leftExpression);
    expect(result[0].type).toBe(NodeType.IllegalExpression);
    expect((result[0] as IllegalExpression).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalExpression).error.column).toBe(5);
  });
});

describe('parseBlockStatement', () => {
  it('parses block statement', () => {
    const input = 'then 1 end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
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
      },
      2
    ];
    expect(parseBlockStatement(tokens, 0)).toEqual(result);
  });

  it('parses block statements', () => {
    const input = 'then 1 a end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
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
            token: { type: TokenType.Identifier, literal: 'a', column: 8, line: 1 },
            expression: {
              type: NodeType.Identifier,
              token: { type: TokenType.Identifier, literal: 'a', column: 8, line: 1 },
              value: 'a'
            }
          }
        ]
      },
      3
    ];
    expect(parseBlockStatement(tokens, 0)).toEqual(result);
  });

  it('returns error if block statement is not closed', () => {
    const input = 'then 1';
    const [tokens, _] = tokenize(input);
    const result = parseBlockStatement(tokens, 0);
    expect(result[0].type).toBe(NodeType.IllegalStatement);
    expect((result[0] as IllegalStatement).error.type).toBe(ErrorType.StatementError);
    expect((result[0] as IllegalStatement).error.column).toBe(7);
  });
});

describe('parseIfExpression', () => {
  it('parses if statement', () => {
    const input = 'if true then 1 end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.IfExpression,
        token: { type: TokenType.If, literal: 'if', column: 1, line: 1 },
        cases: [
          {
            condition: {
              type: NodeType.Boolean,
              token: { type: TokenType.True, literal: 'true', column: 4, line: 1 },
              value: true
            },
            statement: {
              type: NodeType.BlockStatement,
              token: { type: TokenType.Then, literal: 'then', column: 9, line: 1 },
              statements: [
                {
                  type: NodeType.ExpressionStatement,
                  token: { type: TokenType.Int, literal: '1', column: 14, line: 1 },
                  expression: {
                    type: NodeType.Integer,
                    token: { type: TokenType.Int, literal: '1', column: 14, line: 1 },
                    value: 1
                  }
                }
              ]
            }
          }
        ],
        elseCase: null
      },
      4
    ];
    expect(parseIfExpression(tokens, 0)).toEqual(result);
  });

  it(`returns error if 'then' is missing`, () => {
    const input = 'if true 1 end';
    const [tokens, _] = tokenize(input);
    const result = parseIfExpression(tokens, 0);
    expect(result[0].type).toBe(NodeType.IllegalExpression);
    expect((result[0] as IllegalExpression).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalExpression).error.column).toBe(9);
  });

  it('parses if else statement', () => {
    const input = 'if true then 1 else 2 end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.IfExpression,
        token: { type: TokenType.If, literal: 'if', column: 1, line: 1 },
        cases: [
          {
            condition: {
              type: NodeType.Boolean,
              token: { type: TokenType.True, literal: 'true', column: 4, line: 1 },
              value: true
            },
            statement: {
              type: NodeType.BlockStatement,
              token: { type: TokenType.Then, literal: 'then', column: 9, line: 1 },
              statements: [
                {
                  type: NodeType.ExpressionStatement,
                  token: { type: TokenType.Int, literal: '1', column: 14, line: 1 },
                  expression: {
                    type: NodeType.Integer,
                    token: { type: TokenType.Int, literal: '1', column: 14, line: 1 },
                    value: 1
                  }
                }
              ]
            }
          }
        ],
        elseCase: {
          type: NodeType.BlockStatement,
          token: { type: TokenType.Else, literal: 'else', column: 16, line: 1 },
          statements: [
            {
              type: NodeType.ExpressionStatement,
              token: { type: TokenType.Int, literal: '2', column: 21, line: 1 },
              expression: {
                type: NodeType.Integer,
                token: { type: TokenType.Int, literal: '2', column: 21, line: 1 },
                value: 2
              }
            }
          ]
        }
      },
      6
    ];
    expect(parseIfExpression(tokens, 0)).toEqual(result);
  });

  it('parses elsif statement', () => {
    const input = 'if true then 1 elsif false then 2 end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.IfExpression,
        token: { type: TokenType.If, literal: 'if', column: 1, line: 1 },
        cases: [
          {
            condition: {
              type: NodeType.Boolean,
              token: { type: TokenType.True, literal: 'true', column: 4, line: 1 },
              value: true
            },
            statement: {
              type: NodeType.BlockStatement,
              token: { type: TokenType.Then, literal: 'then', column: 9, line: 1 },
              statements: [
                {
                  type: NodeType.ExpressionStatement,
                  token: { type: TokenType.Int, literal: '1', column: 14, line: 1 },
                  expression: {
                    type: NodeType.Integer,
                    token: { type: TokenType.Int, literal: '1', column: 14, line: 1 },
                    value: 1
                  }
                }
              ]
            }
          },
          {
            condition: {
              type: NodeType.Boolean,
              token: { type: TokenType.False, literal: 'false', column: 22, line: 1 },
              value: false
            },
            statement: {
              type: NodeType.BlockStatement,
              token: { type: TokenType.Then, literal: 'then', column: 28, line: 1 },
              statements: [
                {
                  type: NodeType.ExpressionStatement,
                  token: { type: TokenType.Int, literal: '2', column: 33, line: 1 },
                  expression: {
                    type: NodeType.Integer,
                    token: { type: TokenType.Int, literal: '2', column: 33, line: 1 },
                    value: 2
                  }
                }
              ]
            }
          }
        ],
        elseCase: null
      },
      8
    ];
    expect(parseIfExpression(tokens, 0)).toEqual(result);
  });

  it(`returns error if 'then' is missing (elsif)`, () => {
    const input = 'if true then 1 elsif false 2 end';
    const [tokens, _] = tokenize(input);
    const result = parseIfExpression(tokens, 0);
    expect(result[0].type).toBe(NodeType.IllegalExpression);
    expect((result[0] as IllegalExpression).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalExpression).error.column).toBe(28);
  });

  it('parses if elsif else statement', () => {
    const input = 'if true then 1 elsif false then 2 else 3 end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.IfExpression,
        token: { type: TokenType.If, literal: 'if', column: 1, line: 1 },
        cases: [
          {
            condition: {
              type: NodeType.Boolean,
              token: { type: TokenType.True, literal: 'true', column: 4, line: 1 },
              value: true
            },
            statement: {
              type: NodeType.BlockStatement,
              token: { type: TokenType.Then, literal: 'then', column: 9, line: 1 },
              statements: [
                {
                  type: NodeType.ExpressionStatement,
                  token: { type: TokenType.Int, literal: '1', column: 14, line: 1 },
                  expression: {
                    type: NodeType.Integer,
                    token: { type: TokenType.Int, literal: '1', column: 14, line: 1 },
                    value: 1
                  }
                }
              ]
            }
          },
          {
            condition: {
              type: NodeType.Boolean,
              token: { type: TokenType.False, literal: 'false', column: 22, line: 1 },
              value: false
            },
            statement: {
              type: NodeType.BlockStatement,
              token: { type: TokenType.Then, literal: 'then', column: 28, line: 1 },
              statements: [
                {
                  type: NodeType.ExpressionStatement,
                  token: { type: TokenType.Int, literal: '2', column: 33, line: 1 },
                  expression: {
                    type: NodeType.Integer,
                    token: { type: TokenType.Int, literal: '2', column: 33, line: 1 },
                    value: 2
                  }
                }
              ]
            }
          }
        ],
        elseCase: {
          type: NodeType.BlockStatement,
          token: { type: TokenType.Else, literal: 'else', column: 35, line: 1 },
          statements: [
            {
              type: NodeType.ExpressionStatement,
              token: { type: TokenType.Int, literal: '3', column: 40, line: 1 },
              expression: {
                type: NodeType.Integer,
                token: { type: TokenType.Int, literal: '3', column: 40, line: 1 },
                value: 3
              }
            }
          ]
        }
      },
      10
    ];
    expect(parseIfExpression(tokens, 0)).toEqual(result);
  });
});

describe('parseRepeatExpression', () => {
  it('parses repeat expression', () => {
    const input = 'repeat i from 0 to 10 do 1 end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.RepeatExpression,
        token: { type: TokenType.Repeat, literal: 'repeat', column: 1, line: 1 },
        index: { type: NodeType.Identifier, token: { type: TokenType.Identifier, literal: 'i', column: 8, line: 1 }, value: 'i' },
        from: { type: NodeType.Integer, token: { type: TokenType.Int, literal: '0', column: 15, line: 1 }, value: 0 },
        to: { type: NodeType.Integer, token: { type: TokenType.Int, literal: '10', column: 20, line: 1 }, value: 10 },
        statement: {
          type: NodeType.BlockStatement, token: { type: TokenType.Do, literal: 'do', column: 23, line: 1 },
          statements: [
            {
              type: NodeType.ExpressionStatement,
              token: { type: TokenType.Int, literal: '1', column: 26, line: 1 },
              expression: {
                type: NodeType.Integer,
                token: { type: TokenType.Int, literal: '1', column: 26, line: 1 },
                value: 1
              }
            }
          ]
        }
      },
      8
    ];
    expect(parseRepeatExpression(tokens, 0)).toEqual(result);
  });

  it('returns error if index variable is missing', () => {
    const input = 'repeat from 0 to 10 do 1 end';
    const [tokens, _] = tokenize(input);
    const result = parseRepeatExpression(tokens, 0);
    expect(result[0].type).toBe(NodeType.IllegalExpression);
    expect((result[0] as IllegalExpression).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalExpression).error.column).toBe(8);
  });

  it(`returns error if 'from' is missing`, () => {
    const input = 'repeat i 0 to 10 do 1 end';
    const [tokens, _] = tokenize(input);
    const result = parseRepeatExpression(tokens, 0);
    expect(result[0].type).toBe(NodeType.IllegalExpression);
    expect((result[0] as IllegalExpression).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalExpression).error.column).toBe(10);
  });

  it(`returns error if 'to' is missing`, () => {
    const input = 'repeat i from 0 10 do 1 end';
    const [tokens, _] = tokenize(input);
    const result = parseRepeatExpression(tokens, 0);
    expect(result[0].type).toBe(NodeType.IllegalExpression);
    expect((result[0] as IllegalExpression).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalExpression).error.column).toBe(17);
  });

  it(`returns error if 'do' is missing`, () => {
    const input = 'repeat i from 0 to 10 1 end';
    const [tokens, _] = tokenize(input);
    const result = parseRepeatExpression(tokens, 0);
    expect(result[0].type).toBe(NodeType.IllegalExpression);
    expect((result[0] as IllegalExpression).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalExpression).error.column).toBe(23);
  });
});

describe('parseAttributeStatement', () => {
  it('parses attribute statement', () => {
    const input = 'width 200';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.Attribute,
        token: { type: TokenType.Attribute, literal: 'width', column: 1, line: 1 },
        name: { type: NodeType.Identifier, token: { type: TokenType.Attribute, literal: 'width', column: 1, line: 1 }, value: 'width' },
        value: { type: NodeType.Integer, token: { type: TokenType.Int, literal: '200', column: 7, line: 1 }, value: 200 }
      },
      1
    ];
    expect(parseAttributeStatement(tokens, 0)).toEqual(result);
  });

  it('parses attribute statement with only 1 value per key', () => {
    const input = 'width 200 200';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.Attribute,
        token: { type: TokenType.Attribute, literal: 'width', column: 1, line: 1 },
        name: { type: NodeType.Identifier, token: { type: TokenType.Attribute, literal: 'width', column: 1, line: 1 }, value: 'width' },
        value: { type: NodeType.Integer, token: { type: TokenType.Int, literal: '200', column: 7, line: 1 }, value: 200 }
      },
      1
    ];
    expect(parseAttributeStatement(tokens, 0)).toEqual(result);
  });
});

describe('parseSizeExpression', () => {
  it('parses size expression', () => {
    const input = 'size end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.SizeExpression,
        token: { type: TokenType.Size, literal: 'size', column: 1, line: 1 },
        width: null,
        height: null,
        statement: {
          type: NodeType.BlockStatement, token: { type: TokenType.Size, literal: 'size', column: 1, line: 1 },
          statements: []
        }
      },
      1
    ];
    expect(parseSizeExpression(tokens, 0)).toEqual(result);
  });

  it(`parses size expression with 'width' and 'height' attributes`, () => {
    const input = 'size width 500 height 500 end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.SizeExpression,
        token: { type: TokenType.Size, literal: 'size', column: 1, line: 1 },
        width: {
          type: NodeType.Attribute,
          token: { type: TokenType.Attribute, literal: 'width', column: 6, line: 1},
          name: {
            type: NodeType.Identifier,
            token: { type: TokenType.Attribute, literal: 'width', column: 6, line: 1},
            value: 'width'
          },
          value: {
            type: NodeType.Integer,
            token: { type: TokenType.Int, literal: '500', column: 12, line: 1},
            value: 500
          }
        },
        height: {
          type: NodeType.Attribute,
          token: { type: TokenType.Attribute, literal: 'height', column: 16, line: 1},
          name: {
            type: NodeType.Identifier,
            token: { type: TokenType.Attribute, literal: 'height', column: 16, line: 1},
            value: 'height'
          },
          value: {
            type: NodeType.Integer,
            token: { type: TokenType.Int, literal: '500', column: 23, line: 1},
            value: 500
          }
        },
        statement: {
          type: NodeType.BlockStatement, token: { type: TokenType.Int, literal: '500', column: 23, line: 1 },
          statements: []
        }
      },
      5
    ];
    expect(parseSizeExpression(tokens, 0)).toEqual(result);
  });

  it(`returns error if attribute but 'width' or 'height' is provided`, () => {
    const input = 'size scale 1 end';
    const [tokens, _] = tokenize(input);
    const result = parseSizeExpression(tokens, 0);
    expect(result[0].type).toBe(NodeType.IllegalExpression);
    expect((result[0] as IllegalExpression).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalExpression).error.column).toBe(6);
  });
});

describe('parseTagExpression', () => {
  it('parses tag expression', () => {
    const input = 'group end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.TagExpression,
        token: { type: TokenType.Tag, literal: 'group', column: 1, line: 1 },
        name: 'group',
        attributes: [],
        statement: { type: NodeType.BlockStatement, token: { type: TokenType.Tag, literal: 'group', column: 1, line: 1 }, statements: [] }
      },
      1
    ];
    expect(parseTagExpression(tokens, 0)).toEqual(result);
  });

  it('parses tag expression with attributes', () => {
    const input = 'rectangle width 50 end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.TagExpression,
        token: { type: TokenType.Tag, literal: 'rectangle', column: 1, line: 1 },
        name: 'rectangle',
        attributes: [
          {
            type: NodeType.Attribute,
            token: { type: TokenType.Attribute, literal: 'width', column: 11, line: 1 },
            name: { type: NodeType.Identifier, token: { type: TokenType.Attribute, literal: 'width', column: 11, line: 1 }, value: 'width' },
            value: { type: NodeType.Integer, token: { type: TokenType.Int, literal: '50', column: 17, line: 1 }, value: 50 }
          }
        ],
        statement: { type: NodeType.BlockStatement, token: { type: TokenType.Int, literal: '50', column: 17, line: 1 }, statements: [] }
      },
      3
    ];
    expect(parseTagExpression(tokens, 0)).toEqual(result);
  });

  it('parses tag expression with block statement', () => {
    const input = 'group if true then end end';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.TagExpression,
        token: { type: TokenType.Tag, literal: 'group', column: 1, line: 1 },
        name: 'group',
        attributes: [],
        statement: {
          type: NodeType.BlockStatement,
          token: { type: TokenType.Tag, literal: 'group', column: 1, line: 1 },
          statements: [
            {
              type: NodeType.ExpressionStatement,
              token: { type: 'If', literal: 'if', column: 7, line: 1 },
              expression: {
                type: NodeType.IfExpression,
                token: { type: 'If', literal: 'if', column: 7, line: 1 },
                cases: [
                  {
                    condition: { type: NodeType.Boolean, token: { type: 'True', literal: 'true', column: 10, line: 1 }, value: true },
                    statement: { type: NodeType.BlockStatement, token: { type: 'Then', literal: 'then', column: 15, line: 1 }, statements: [] }
                  }
                ],
                elseCase: null
              }
            }
          ]
        }
      },
      5
    ];
    expect(parseTagExpression(tokens, 0)).toEqual(result);
  });
});

describe('parseExpression', () => {
  it ('parses prefix expression', () => {
    const input = '-1';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.PrefixExpression,
        token: { type: TokenType.Minus, literal: '-', column: 1, line: 1 },
        operator: '-',
        right: {
          type: NodeType.Integer,
          token: { type: TokenType.Int, literal: '1', column: 2, line: 1 },
          value: 1
        }
      },
      1
    ];
    expect(parseExpression(tokens, 0, PrecedenceLevel.Lowest)).toEqual(result);
  });

  it('returns IllegalExpression if prefix function is not found', () => {
    const input = '/1';
    const [tokens, _] = tokenize(input);
    const result = parseExpression(tokens, 0, PrecedenceLevel.Lowest);
    expect(result[0].type).toBe(NodeType.IllegalExpression);
    expect((result[0] as IllegalExpression).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalExpression).error.column).toBe(1);
  });

  it ('parses infix expression', () => {
    const input = '1 + 1';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.InfixExpression,
        token: { type: TokenType.Plus, literal: '+', column: 3, line: 1 },
        operator: '+',
        left: {
          type: NodeType.Integer,
          token: { type: TokenType.Int, literal: '1', column: 1, line: 1 },
          value: 1
        },
        right: {
          type: NodeType.Integer,
          token: { type: TokenType.Int, literal: '1', column: 5, line: 1 },
          value: 1
        }
      },
      2
    ];
    expect(parseExpression(tokens, 0, PrecedenceLevel.Lowest)).toEqual(result);
  });

  it('returns prefix expression if infix function is not found', () => {
    const input = '-1 1';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.PrefixExpression,
        token: { type: TokenType.Minus, literal: '-', column: 1, line: 1 },
        operator: '-',
        right: {
          type: NodeType.Integer,
          token: { type: TokenType.Int, literal: '1', column: 2, line: 1 },
          value: 1
        }
      },
      1
    ];
    expect(parseExpression(tokens, 0, PrecedenceLevel.Lowest)).toEqual(result);
  });
});

describe('parseExpressionStatement', () => {
  it('parses expression statement', () => {
    const input = '1 + 1';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.ExpressionStatement,
        token: { type: TokenType.Int, literal: '1', column: 1, line: 1 },
        expression: {
          type: NodeType.InfixExpression,
          token: { type: TokenType.Plus, literal: '+', column: 3, line: 1 },
          operator: '+',
          left: {
            type: NodeType.Integer,
            token: { type: TokenType.Int, literal: '1', column: 1, line: 1 },
            value: 1
          },
          right: {
            type: NodeType.Integer,
            token: { type: TokenType.Int, literal: '1', column: 5, line: 1 },
            value: 1
          }
        }
      },
      2
    ];
    expect(parseExpressionStatement(tokens, 0)).toEqual(result);
  });
});

describe('parseSetStatement', () => {
  it('parses set statement', () => {
    const input = 'set a 1';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.SetStatement,
        token: { type: TokenType.Set, literal: 'set', column: 1, line: 1 },
        name: {
          type: NodeType.Identifier,
          token: { type: TokenType.Identifier, literal: 'a', column: 5, line: 1 },
          value: 'a'
        },
        value: {
          type: NodeType.Integer,
          token: { type: TokenType.Int, literal: '1', column: 7, line: 1 },
          value: 1
        }
      },
      2
    ];
    expect(parseSetStatement(tokens, 0)).toEqual(result);
  });

  it('returns error if variable name is not provided', () => {
    const input = 'set 2 1';
    const [tokens, _] = tokenize(input);
    const result = parseSetStatement(tokens, 0);
    expect(result[0].type).toBe(NodeType.IllegalStatement);
    expect((result[0] as IllegalStatement).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalStatement).error.column).toBe(5);
  });
});

describe('parseUpdateStatement', () => {
  it('parses update statement', () => {
    const input = 'update a 1';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.UpdateStatement,
        token: { type: TokenType.Update, literal: 'update', column: 1, line: 1 },
        name: {
          type: NodeType.Identifier,
          token: { type: TokenType.Identifier, literal: 'a', column: 8, line: 1 },
          value: 'a'
        },
        value: {
          type: NodeType.Integer,
          token: { type: TokenType.Int, literal: '1', column: 10, line: 1 },
          value: 1
        }
      },
      2
    ];
    expect(parseUpdateStatement(tokens, 0)).toEqual(result);
  });

  it('returns error if variable name is not provided', () => {
    const input = 'update 2 1';
    const [tokens, _] = tokenize(input);
    const result = parseUpdateStatement(tokens, 0);
    expect(result[0].type).toBe(NodeType.IllegalStatement);
    expect((result[0] as IllegalStatement).error.type).toBe(ErrorType.SyntaxError);
    expect((result[0] as IllegalStatement).error.column).toBe(8);
  });
});

describe('parseStatement', () => {
  it('parses set statement', () => {
    const input = 'set a 1';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.SetStatement,
        token: { type: TokenType.Set, literal: 'set', column: 1, line: 1 },
        name: {
          type: NodeType.Identifier,
          token: { type: TokenType.Identifier, literal: 'a', column: 5, line: 1 },
          value: 'a'
        },
        value: {
          type: NodeType.Integer,
          token: { type: TokenType.Int, literal: '1', column: 7, line: 1 },
          value: 1
        }
      },
      2
    ];
    expect(parseStatement(tokens, 0)).toEqual(result);
  });

  it('parses update statement', () => {
    const input = 'update a 1';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.UpdateStatement,
        token: { type: TokenType.Update, literal: 'update', column: 1, line: 1 },
        name: {
          type: NodeType.Identifier,
          token: { type: TokenType.Identifier, literal: 'a', column: 8, line: 1 },
          value: 'a'
        },
        value: {
          type: NodeType.Integer,
          token: { type: TokenType.Int, literal: '1', column: 10, line: 1 },
          value: 1
        }
      },
      2
    ];
    expect(parseStatement(tokens, 0)).toEqual(result);
  });

  it('parses expression statement', () => {
    const input = '1 + 1';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.ExpressionStatement,
        token: { type: TokenType.Int, literal: '1', column: 1, line: 1 },
        expression: {
          type: NodeType.InfixExpression,
          token: { type: TokenType.Plus, literal: '+', column: 3, line: 1 },
          operator: '+',
          left: {
            type: NodeType.Integer,
            token: { type: TokenType.Int, literal: '1', column: 1, line: 1 },
            value: 1
          },
          right: {
            type: NodeType.Integer,
            token: { type: TokenType.Int, literal: '1', column: 5, line: 1 },
            value: 1
          }
        }
      },
      2
    ];
    expect(parseStatement(tokens, 0)).toEqual(result);
  });
});

// TODO: more test cases
describe('parse', () => {
  it('parses tokens', () => {
    const input = 'set a 1; -a';
    const [tokens, _] = tokenize(input);
    const result = [
      {
        type: NodeType.Program,
        statements: [
          {
            type: NodeType.SetStatement,
            token: { type: TokenType.Set, literal: 'set', column: 1, line: 1 },
            name: { type: NodeType.Identifier, token: { type: TokenType.Identifier, literal: 'a', column: 5, line: 1 }, value: 'a' },
            value: { type: NodeType.Integer, token: { type: TokenType.Int, literal: '1', column: 7, line: 1 }, value: 1 }
          },
          {
            type: NodeType.ExpressionStatement,
            token: { type: TokenType.Minus, literal: '-', column: 10, line: 1 },
            expression: {
              type: NodeType.PrefixExpression,
              token: { type: TokenType.Minus, literal: '-', column: 10, line: 1 },
              operator: '-',
              right: { type: NodeType.Identifier, token: { type: TokenType.Identifier, literal: 'a', column: 11, line: 1 }, value: 'a' }
            }
          }
        ]
      },
      null
    ];
    expect(parse(tokens)).toEqual(result);
  });
});
