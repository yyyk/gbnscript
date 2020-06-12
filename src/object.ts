import { ErrorInterface } from './error';

export enum ObjectType {
  Error = 'Error',
  Null = 'Null',
  Int = 'Int',
  Float = 'Float',
  Boolean = 'Boolean',
  Attribute = 'Attribute'
}

export interface ObjectInterface {
  readonly type: ObjectType;
}

export interface ErrorObject extends ObjectInterface {
  value: ErrorInterface;
}

export function createErrorObject (error: ErrorInterface): ErrorObject {
  return {
    type: ObjectType.Error,
    value: error
  };
}

export interface NullObject extends ObjectInterface {
  value: null;
}

const NULL: NullObject = {
  type: ObjectType.Null,
  value: null
};

export function createNullObject (): NullObject {
  return NULL;
}

export interface IntegerObject extends ObjectInterface {
  value: number;
}

export function createIntegerObject (value: number): IntegerObject {
  return {
    type: ObjectType.Int,
    value
  };
}

export interface FloatObject extends ObjectInterface {
  value: number;
}

export function createFloatObject (value: number): FloatObject {
  return {
    type: ObjectType.Float,
    value
  };
}

export interface BooleanObject extends ObjectInterface {
  value: boolean;
}

const TRUE: BooleanObject = {
  type: ObjectType.Boolean,
  value: true
};

const FALSE: BooleanObject = {
  type: ObjectType.Boolean,
  value: false
};

export function createBooleanObject (value: boolean): BooleanObject {
  if (value) {
    return TRUE;
  }
  return FALSE;
}

export interface AttributeObject extends ObjectInterface {
  key: string;
  value: number;
}

export function createAttributeObject (key: string, value: number): AttributeObject {
  return {
    type: ObjectType.Attribute,
    key,
    value
  };
}
