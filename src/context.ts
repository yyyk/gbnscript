import { ObjectInterface } from './object';

export interface Context {
  parent: Context|null;
  symbols: {[key in string]: ObjectInterface};
}

export function createContext (context: Context|null = null): Context {
  return {
    parent: context, // TODO: should i clone context?
    symbols: {}
  };
}

export function cloneSymbols (symbols: {[key in string]: ObjectInterface}): {[key in string]: ObjectInterface} {
  const result: {[key in string]: ObjectInterface} = {};
  for (const key in symbols) {
    if (symbols.hasOwnProperty(key)) {
      result[key] = { ...symbols[key] };
    }
  }
  return result;
}

export function cloneContext (context: Context): Context {
  if (context.parent === null) {
    return {
      parent: null,
      symbols: cloneSymbols(context.symbols)
    };
  }
  return {
    parent: cloneContext(context.parent),
    symbols: cloneSymbols(context.symbols)
  };
}
