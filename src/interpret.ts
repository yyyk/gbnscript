import { createContext } from './context';
import { ErrorInterface } from './error';
import { evaluate } from './evaluate';
import { tokenize } from './lexer';
import { ErrorObject, ObjectInterface, ObjectType } from './object';
import { parse } from './parser';
import { convertProductStringToObject, ProductObject } from './product';

export type OutputData = {
  size: ProductObject;
  grid: ProductObject[];
} | null;

export interface Output {
  success: boolean;
  error?: ErrorInterface;
  log?: ObjectInterface;
  data?: OutputData;
}

export function interpret (input: string): Output {
  const [tokens, tokenError] = tokenize(input);

  if (tokenError) {
    return {
      success: false,
      error: tokenError
    };
  }

  const [program, parseError] = parse(tokens);

  if (parseError) {
    return {
      success: false,
      error: parseError
    };
  }

  const [result, , product] = evaluate(program, createContext());

  if (result.type === ObjectType.Error) {
    return {
      success: false,
      error: (result as ErrorObject).value
    };
  }

  // if (product.size === '' || product.grid.length === 0) {
  if (product.size === '') {
    return {
      success: true,
      log: result,
      data: null
    };
  }

  const grid: ProductObject[] = product.grid.map((g: string) => convertProductStringToObject(g));
  const root: ProductObject = { id: 'size', parent: '', children: [] };
  const list: { [key: string]: ProductObject } = { size: root };

  for (const g of grid) {
    list[g.id] = g;
    list[g.parent as string].children?.push(list[g.id]);
  }

  const output: OutputData = {
    size: convertProductStringToObject(product.size),
    grid: (root.children as ProductObject[]).map((child: ProductObject) => {
      child.parent = null;
      return child;
    })
  };

  return {
    success: true,
    log: result,
    data: output
  };
}
