export enum TokenType {
  Illegal = 'Illegal',
  EOF = 'EOF',

  Identifier = 'Identifier',
  Int = 'Int',
  Float = 'Float',

  // Operators
  Plus = 'Plus',                         // +
  Minus = 'Minus',                       // -
  Asterisk = 'Asterisk',                 // *
  Slash = 'Slash',                       // /
  Mod = 'Mod',                           // %
  Pow = 'Pow',                           // **

  // Comparator
  LessThan = 'LessThan',                 // <
  GreaterThan = 'GreaterThan',           // >
  LessThanEqual = 'LessThanEqual',       // <=
  GreaterThanEqual = 'GreaterThanEqual', // >=

  Equal = 'Equal',                       // ==
  NotEqual = 'NotEqual',                 // !=

  LeftParenthesis = 'LeftParenthesis',   // (
  RightParenthesis = 'RightParenthesis', // )

  // To avoid 'set a 5\n-a' being 'set a (5 - a)' 'set a 5;\n-a'
  Semicolon = 'Semicolon',               // ;

  // Keywords
  True = 'True',                         // true
  False = 'False',                       // false

  Not = 'Not',                           // not
  And = 'And',                           // and
  Or = 'Or',                             // or

  Set = 'Set',                           // set
  Update = 'Update',                     // update (Assign)

  End = 'End',                           // end

  If = 'If',                             // if
  Then = 'Then',                         // then
  Elsif = 'Elsif',                       // elsif
  Else = 'Else',                         // else

  Repeat = 'Repeat',                     // repeat
  From = 'From',                         // from
  To = 'To',                             // to
  Do = 'Do',                             // do

  Size = 'Size',                         // size
  Tag = 'Tag',                           // group, rectangle
  Attribute = 'Attribute'                // width, height, positionX,Y, rotate, scale, scaleX,Y
}

export const Keywords: { [index: string]: TokenType } = {
  true: TokenType.True,
  false: TokenType.False,

  not: TokenType.Not,

  and: TokenType.And,
  or: TokenType.Or,

  set: TokenType.Set,
  update: TokenType.Update,

  end: TokenType.End,

  if: TokenType.If,
  then: TokenType.Then,
  elsif: TokenType.Elsif,
  else: TokenType.Else,

  repeat: TokenType.Repeat,
  from: TokenType.From,
  to: TokenType.To,
  do: TokenType.Do,

  size: TokenType.Size,

  group: TokenType.Tag,
  rectangle: TokenType.Tag,

  width: TokenType.Attribute,
  height: TokenType.Attribute,

  positionX: TokenType.Attribute,
  positionY: TokenType.Attribute,

  rotate: TokenType.Attribute,

  scale: TokenType.Attribute,
  scaleX: TokenType.Attribute,
  scaleY: TokenType.Attribute
};

export interface Token {
  type: TokenType;
  literal: string;
  column: number;
  line: number;
}

export function lookupIdentifier (literal: string): TokenType {
  return Keywords[literal] || TokenType.Identifier;
}
