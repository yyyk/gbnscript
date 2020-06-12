import { ErrorType } from '../error';
import { interpret } from '../interpret';
import { ObjectType } from '../object';

describe('interpret', () => {
  describe('returns token error if it fails to tokenize', () => {
    const input = 'a = 1';
    const result = interpret(input);

    it(`contains 'success: false'`, () => {
      expect(result.success).toBe(false);
    });

    it('contains error', () => {
      const { error } = result;
      expect(error.type).toBe(ErrorType.ExpectedCharError);
      expect(error.message).toBe(`'=' is missing after '='.`);
      expect(error.line).toBe(1);
      expect(error.column).toBe(4);
    });
  });

  describe('returns parse error if it fails to parse', () => {
    const input = '( 1 + 2 / 3';
    const result = interpret(input);

    it(`contains 'success: false'`, () => {
      expect(result.success).toBe(false);
    });

    it('contains error', () => {
      const { error } = result;
      expect(error.type).toBe(ErrorType.SyntaxError);
      expect(error.message).toBe(`')' is missing.`);
      expect(error.line).toBe(1);
      expect(error.column).toBe(12);
    });
  });

  describe('returns parse error if it fails to evaluate', () => {
    const input = 'size width 300 end';
    const result = interpret(input);

    it(`contains 'success: false'`, () => {
      expect(result.success).toBe(false);
    });

    it('contains error', () => {
      const { error } = result;
      expect(error.type).toBe(ErrorType.SyntaxError);
      expect(error.message).toBe(`Attribute 'height' is missing for 'size'.`);
      expect(error.line).toBe(1);
      expect(error.column).toBe(1);
    });
  });

  describe(`interprets code without 'size'`, () => {
    const input = 'set a 100; a';
    const result = interpret(input);

    it(`contains 'success: true'`, () => {
      expect(result.success).toBe(true);
    });

    it(`contains 'log'`, () => {
      const log = {
        type: ObjectType.Int,
        value: 100
      };
      expect(result.log).toEqual(log);
    });

    it(`contains 'data: null'`, () => {
      expect(result.data).toBe(null);
    });
  });

  describe(`interprets code with 'size'`, () => {
    const input = `
      size width 200 height 200
        group
          set a 1

          if 1 == 1 then
            update a 2
          end

          rectangle
            width 30 height 30
            positionX 0 positionY 0
          end

          rectangle
            width 30 height 60 / a
            positionX 30 * a positionY 0
          end

          group
            rectangle
              width 30 height 30
              positionX 30 * a * 2 positionY 0
            end
          end
        end

        rectangle
          width 30 height 30
          positionX 0 positionY 60
        end
      end
    `;
    const result = interpret(input);

    it(`contains 'success: true'`, () => {
      expect(result.success).toBe(true);
    });

    it(`contains 'log'`, () => {
      const log = {
        type: ObjectType.Attribute,
        key: 'positionY',
        value: 60
      };
      expect(result.log).toEqual(log);
    });

    it(`contains 'data'`, () => {
      const data = {
        size: { id: 'size', width: 200, height: 200 },
        grid: [
          {
            id: '0',
            parent: null,
            tag: 'group',
            children: [
              { id: '1', parent: '0', tag: 'rectangle', width: 30, height: 30, positionX: 0, positionY: 0 },
              { id: '2', parent: '0', tag: 'rectangle', width: 30, height: 30, positionX: 60, positionY: 0 },
              { id: '3', parent: '0', tag: 'group', children: [
                { id: '4', parent: '3', tag: 'rectangle', width: 30, height: 30, positionX: 120, positionY: 0 }
              ] }
            ]
          },
          { id: '5', parent: null, tag: 'rectangle', width: 30, height: 30, positionX: 0, positionY: 60 }
        ]
      };
      expect(result.data).toEqual(data);
    });

  });
});
