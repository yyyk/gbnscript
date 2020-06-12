import { convertProductStringToObject, parseValue } from '../product';

describe('convertProductStringToObject', () => {
  it(`converts 'size' ProductString to ProductObject`, () => {
    const input = 'id size, width 500, height 500';
    const result = {
      id: 'size',
      width: 500,
      height: 500
    };
    expect(convertProductStringToObject(input)).toEqual(result);
  });

  it(`converts 'group' ProductString to ProductObject with 'children' key`, () => {
    const input = 'id 0, parent size, tag group, positionX 0, positionY 0';
    const result = {
      id: '0',
      parent: 'size',
      tag: 'group',
      positionX: 0,
      positionY: 0,
      children: []
    };
    expect(convertProductStringToObject(input)).toEqual(result);
  });

  it(`eliminates 'width' and 'height' from 'group', since they are unsupported attributes`, () => {
    const input = 'id 0, parent size, tag group, width 500, height 500, positionX 0, positionY 0';
    const result = {
      id: '0',
      parent: 'size',
      tag: 'group',
      positionX: 0,
      positionY: 0,
      children: []
    };
    expect(convertProductStringToObject(input)).toEqual(result);
  });

  it(`converts 'rectangle' ProductString to ProductObject`, () => {
    const input = 'id 0, parent size, tag rectangle, width 500, height 500, positionX 0, positionY 0';
    const result = {
      id: '0',
      parent: 'size',
      tag: 'rectangle',
      width: 500,
      height: 500,
      positionX: 0,
      positionY: 0
    };
    expect(convertProductStringToObject(input)).toEqual(result);
  });
});

describe('parseValue', () => {
  describe(`converts string to number if key is not 'id', 'tag', or 'parent'`, () => {
    it(`case width: '200'`, () => {
      const key = 'width';
      const value = '200';
      const result = 200;
      expect(parseValue(key, value)).toBe(result);
    });

    it(`case tag: 'group'`, () => {
      const key = 'tag';
      const value = 'group';
      const result = 'group';
      expect(parseValue(key, value)).toBe(result);
    });
  });
});
