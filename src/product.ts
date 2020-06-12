/*
ProductString
  size: 'id size, width {width}, height {height}'
  tag: 'id {id}, parent {parentID}, tag {tag}, attribute {attribute}'
*/

export type ProductString = string;

export interface Product {
  size: ProductString;
  grid: ProductString[];
  currentScope: string;
}

export function createProduct () {
  return {
    size: '',
    grid: [],
    currentScope: ''
  };
}

export function cloneProduct (product: Product) {
  return {
    size: product.size,
    grid: [...product.grid],
    currentScope: product.currentScope
  };
}

export interface ProductObject {
  id: string;
  parent?: string | null;
  tag?: string;
  width?: number;
  height?: number;
  positionX?: number;
  positionY?: number;
  rotate?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  children?: ProductObject[];
}

// export function isKeyInProductObject (key: string) {
//   return key === 'id' ||
//     key === 'parent' || key === 'tag' ||
//     key === 'width' || key === 'height' ||
//     key === 'positionX' || key === 'positionY' ||
//     key === 'rotate' || key === 'scale' ||
//     key === 'scaleX' || key === 'scaleY';
// }

const productObjectKeys = [
  'id',
  'parent', 'tag',
  'width', 'height',
  'positionX', 'positionY',
  'rotate', 'scale',
  'scaleX', 'scaleY'
];

export function parseValue (key: string, value: string): string|number {
  if (key === 'id' || key === 'parent' || key === 'tag') {
    return value;
  }
  return parseFloat(value);
}

export function convertProductStringToObject (str: ProductString): ProductObject {
  const arr: string[] = str.split(',');
  const result: ProductObject = {
    id: ''
  };
  for (const pair of arr) {
    const pairArr = pair.trim().split(' ');
    const key = pairArr[0];
    const value = pairArr[1];
    if (productObjectKeys.includes(key) && value.trim() !== '') {
      (result as any)[key] = parseValue(key, value);
    }
  }
  if (result.tag === 'group') {
    result.children = [];
    if (result.width) {
      delete result.width;
    }
    if (result.height) {
      delete result.height;
    }
  }
  return result;
}
