import { TokenType } from './tokens';

export enum PrecedenceLevel {
  None = 0,
  Lowest,
  Or,             // or
  And,            // and
  Equals,         // == or !=
  Comparison,     // > or <
  Term,           // + or -
  Factor,         // * or /
  Power,          // **
  Mod,            // %
  Prefix          // -x or !x
}

export const precedences: {[key: string]: PrecedenceLevel} = {
  [TokenType.Equal]: PrecedenceLevel.Equals,
  [TokenType.NotEqual]: PrecedenceLevel.Equals,

  [TokenType.LessThan]: PrecedenceLevel.Comparison,
  [TokenType.LessThanEqual]: PrecedenceLevel.Comparison,
  [TokenType.GreaterThan]: PrecedenceLevel.Comparison,
  [TokenType.GreaterThanEqual]: PrecedenceLevel.Comparison,

  [TokenType.Plus]: PrecedenceLevel.Term,
  [TokenType.Minus]: PrecedenceLevel.Term,
  [TokenType.Slash]: PrecedenceLevel.Factor,
  [TokenType.Asterisk]: PrecedenceLevel.Factor,
  [TokenType.Pow]: PrecedenceLevel.Power,
  [TokenType.Mod]: PrecedenceLevel.Mod,

  [TokenType.And]: PrecedenceLevel.And,
  [TokenType.Or]: PrecedenceLevel.Or
};
