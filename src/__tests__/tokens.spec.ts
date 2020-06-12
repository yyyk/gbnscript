import { lookupIdentifier, TokenType } from '../tokens';

describe('lookupIdentifier', () => {
  it(`returns Identifier if passed string doesn't match keywords`, () => {
    const input: string = 'abc';
    const result: TokenType = TokenType.Identifier;
    expect(lookupIdentifier(input)).toBe(result);
  });

  it(`returns TokenType.If from string input 'if'`, () => {
    const input: string = 'if';
    const result: TokenType = TokenType.If;
    expect(lookupIdentifier(input)).toBe(result);
  });
});
