import {
  AttributeStatement,
  BlockStatement,
  BooleanLiteral,
  Expression,
  ExpressionStatement,
  FloatLiteral,
  Identifier,
  IfExpression,
  InfixExpression,
  IntegerLiteral,
  Node,
  NodeType,
  PrefixExpression,
  Program,
  RepeatExpression,
  SetStatement,
  SizeExpression,
  TagExpression,
  UpdateStatement
} from './ast';
import {
  cloneContext,
  Context,
  createContext
} from './context';
import { ErrorType } from './error';
import {
  AttributeObject,
  BooleanObject,
  createAttributeObject,
  createBooleanObject,
  createErrorObject,
  createFloatObject,
  createIntegerObject,
  createNullObject,
  ErrorObject,
  FloatObject,
  IntegerObject,
  ObjectInterface,
  ObjectType
} from './object';
import {
  cloneProduct,
  createProduct,
  Product
} from './product';

// PrefixExpression
export function evalPrefixExpression (operator: string, right: IntegerObject|FloatObject|BooleanObject): IntegerObject|FloatObject|BooleanObject|ErrorObject {
  switch (operator) {
    case 'not':
      if (right.type === ObjectType.Boolean) {
        return createBooleanObject(!((right as BooleanObject).value));
      }
      return createErrorObject({
        type: ErrorType.TypeError,
        message: `Wrong type to have 'not'. Please use boolean type.`
      });
    case '-':
      if (right.type === ObjectType.Int) {
        return createIntegerObject(-1 * ((right as IntegerObject).value));
      } else if (right.type === ObjectType.Float) {
        return createFloatObject(-1.0 * ((right as FloatObject).value));
      }
      return createErrorObject({
        type: ErrorType.TypeError,
        message: `Wrong type to have '-'. Please use integer or float type.`
      });
    default:
      return createErrorObject({
        type: ErrorType.SyntaxError,
        message: 'Unknown prefix operator.'
      });
  }
}

// Number
export function evalNumberInfixExpression (operator: string, left: IntegerObject|FloatObject, right: IntegerObject|FloatObject): IntegerObject|FloatObject|BooleanObject|ErrorObject {
  switch (operator) {
    // calculation
    case '+':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createIntegerObject(left.value + right.value);
      }
      return createFloatObject(left.value + right.value);
    case '-':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createIntegerObject(left.value - right.value);
      }
      return createFloatObject(left.value - right.value);
    case '*':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createIntegerObject(left.value * right.value);
      }
      return createFloatObject(left.value * right.value);
    case '/':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createIntegerObject(Math.floor(left.value / right.value));
      }
      return createFloatObject(left.value / right.value);
    case '**':
      if (left.type === ObjectType.Int) {
        return createIntegerObject(Math.pow(left.value, Math.floor(right.value)));
      }
      return createFloatObject(Math.pow(left.value, right.value));
    case '%':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createIntegerObject(left.value % right.value);
      }
      return createFloatObject(left.value % right.value);
    // comparison
    case '>':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createBooleanObject(Math.floor(left.value) > Math.floor(right.value));
      }
      return createBooleanObject(left.value > right.value);
    case '>=':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createBooleanObject(Math.floor(left.value) >= Math.floor(right.value));
      }
      return createBooleanObject(left.value >= right.value);
    case '<':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createBooleanObject(Math.floor(left.value) < Math.floor(right.value));
      }
      return createBooleanObject(left.value < right.value);
    case '<=':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createBooleanObject(Math.floor(left.value) <= Math.floor(right.value));
      }
      return createBooleanObject(left.value <= right.value);
    case '==':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createBooleanObject(Math.floor(left.value) === Math.floor(right.value));
      }
      return createBooleanObject(left.value === right.value);
    case '!=':
      if (left.type === ObjectType.Int && right.type === ObjectType.Int) {
        return createBooleanObject(Math.floor(left.value) !== Math.floor(right.value));
      }
      return createBooleanObject(left.value !== right.value);
    // error
    default:
      return createErrorObject({
        type: ErrorType.SyntaxError,
        message: 'Unknown infix operator.'
      });
  }
}

// Boolean
export function evalBooleanInfixExpression (operator: string, left: BooleanObject, right: BooleanObject): BooleanObject|ErrorObject {
  switch (operator) {
    case 'and':
      return createBooleanObject(left.value && right.value);
    case 'or':
      return createBooleanObject(left.value || right.value);
    case '==':
      return createBooleanObject(left.value === right.value);
    case '!=':
      return createBooleanObject(left.value !== right.value);
    default:
      return createErrorObject({
        type: ErrorType.SyntaxError,
        message: 'Unknown infix operator.'
      });
  }
}

// InfixExpression
export function evalInfixExpression (operator: string, left: ObjectInterface, right: ObjectInterface): IntegerObject|FloatObject|BooleanObject|ErrorObject {
  // Number -> Number|Boolean
  if ((left.type === ObjectType.Int || left.type === ObjectType.Float) &&
      (right.type === ObjectType.Int || right.type === ObjectType.Float)
  ) {
    return evalNumberInfixExpression(operator, left as IntegerObject|FloatObject, right as IntegerObject|FloatObject);
  }
  // Boolean -> Boolean
  if (left.type === ObjectType.Boolean && right.type === ObjectType.Boolean) {
    return evalBooleanInfixExpression(operator, left as BooleanObject, right as BooleanObject);
  }
  // Error
  if (left.type !== right.type) {
    return createErrorObject({
      type: ErrorType.TypeError,
      message: `Type mismatch for ${operator}.`
    });
  }
  return createErrorObject({
    type: ErrorType.SyntaxError,
    message: 'Unknown infix operator.'
  });
}

// BlockStatement
export function evalBlockStatement (node: BlockStatement, context: Context, product: Product): [ObjectInterface, Context, Product] {
  let result: ObjectInterface = createNullObject();
  let currentContext: Context = context;
  let currentProduct: Product = product;
  for (const statement of node.statements) {
    [result, currentContext, currentProduct] = evaluate(statement, currentContext, currentProduct);
    if (result.type === ObjectType.Error) {
      return [result, currentContext, currentProduct];
    }
  }
  return [result, currentContext, currentProduct];
}

// IfExpression
export function evalIfExpression (node: IfExpression, context: Context, product: Product): [ObjectInterface, Context, Product] {
  let result: ObjectInterface = createNullObject();
  let currentContext: Context = context;
  let currentProduct: Product = product;
  for (const _case of node.cases) {
    [result, currentContext, currentProduct] = evaluate(_case.condition, currentContext, currentProduct);
    if (result.type === ObjectType.Error) {
      return [result, currentContext, currentProduct];
    }
    if (result.type !== ObjectType.Boolean) {
      return [
        createErrorObject({
          type: ErrorType.TypeError,
          message: `Invalid condition type.`,
          line: _case.condition.token?.line,
          column: _case.condition.token?.column
        }),
        currentContext,
        currentProduct
      ];
    }
    if ((result as BooleanObject).value) {
      if (_case.statement) {
        let scopedContext = createContext(currentContext);
        [result, scopedContext, currentProduct] = evaluate(_case.statement, scopedContext, currentProduct);
        currentContext = scopedContext.parent || currentContext;
        scopedContext.parent = null;
        return [result, currentContext, currentProduct];
      }
      return [createNullObject(), currentContext, currentProduct];
    }
  }
  if (node.elseCase) {
    let scopedContext = createContext(currentContext);
    [result, scopedContext, currentProduct] = evaluate(node.elseCase, currentContext, currentProduct);
    currentContext = scopedContext.parent || currentContext;
    scopedContext.parent = null;
    return [result, currentContext, currentProduct];
  }
  return [result, currentContext, currentProduct];
}

// Repeat
export function evalRepeatExpression (node: RepeatExpression, context: Context, product: Product): [ObjectInterface, Context, Product] {
  let currentContext: Context = context;
  let currentProduct: Product = product;
  // index
  if (!node.index) { // parser won't let this happen
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `Invalid syntax for repeat index after 'repeat'.`,
        line: node.token.line,
        column: node.token.column
      }),
      currentContext,
      currentProduct
    ];
  }
  const indexKey = node.index.value;
  // from
  if (!node.from) { // parser won't let this happen
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `'from' is missing.`,
        line: node.token.line,
        column: node.token.column
      }),
      currentContext,
      currentProduct
    ];
  }
  let from: ObjectInterface;
  [from, currentContext, currentProduct] = evaluate((node.from as Expression), currentContext, currentProduct);
  if (from.type === ObjectType.Error) {
    return [from, currentContext, currentProduct];
  }
  if (from.type !== ObjectType.Int && from.type !== ObjectType.Float) {
    return [
      createErrorObject({
        type: ErrorType.TypeError,
        message: `Invalid type for 'from'.`,
        line: node.from?.token?.line,
        column: node.from?.token?.column
      }),
      currentContext,
      currentProduct
    ];
  }
  // to
  if (!node.to) { // parser won't let this happen
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `'to' is missing.`,
        line: node.token.line,
        column: node.token.column
      }),
      currentContext,
      currentProduct
    ];
  }
  let to: ObjectInterface;
  [to, currentContext, currentProduct] = evaluate((node.to as Expression), currentContext, currentProduct);
  if (to.type === ObjectType.Error) {
    return [to, currentContext, currentProduct];
  }
  if (to.type !== ObjectType.Int && to.type !== ObjectType.Float) {
    return [
      createErrorObject({
        type: ErrorType.TypeError,
        message: `Invalid type for 'to'`,
        line: node.to?.token?.line,
        column: node.to?.token?.column
      }),
      currentContext,
      currentProduct
    ];
  }
  // do
  let result: ObjectInterface = createNullObject();
  let scopedContext = createContext(currentContext);
  for (let i = (from as IntegerObject|FloatObject).value; i < (to as IntegerObject|FloatObject).value; i++) {
    if (from.type === ObjectType.Float && to.type === ObjectType.Float) {
      scopedContext.symbols[indexKey] = createFloatObject(i);
    } else {
      scopedContext.symbols[indexKey] = createIntegerObject(i);
    }
    if (node.statement) {
      [result, scopedContext, currentProduct] = evaluate(node.statement, scopedContext, currentProduct);
    }
  }
  currentContext = scopedContext.parent || currentContext;
  scopedContext.parent = null;
  return [result, currentContext, currentProduct];
}

// SetStatement
export function evalSetStatement (node: SetStatement, context: Context, product: Product): [ObjectInterface, Context, Product] {
  if (!(node as SetStatement).value) { // parser won't let this happen
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `Value for variable is missing.`,
        line: (node as SetStatement).token.line,
        column: (node as SetStatement).token.column
      }),
      context,
      product
    ];
  }
  const [value, currentContext, currentProduct] = evaluate((node as SetStatement).value as Expression, context, product);
  if (value.type === ObjectType.Error) {
    return [value, currentContext, currentProduct];
  }
  if ((node as SetStatement).name === null) { // parser won't let this happen
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `Variable name is missing.`,
        line: (node as SetStatement).token.line,
        column: (node as SetStatement).token.column
      }),
      currentContext,
      currentProduct
    ];
  }
  const key = ((node as SetStatement).name as Identifier).value;
  currentContext.symbols[key] = value;
  return [value, currentContext, currentProduct];
}

// UpdateStatement
export function evalUpdateStatement (node: UpdateStatement, context: Context, product: Product): [ObjectInterface, Context, Product] {
  if (!(node as UpdateStatement).value) { // parser won't let this happen
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `Value for variable is missing.`,
        line: (node as UpdateStatement).token.line,
        column: (node as UpdateStatement).token.column
      }),
      context,
      product
    ];
  }
  const [value, currentContext, currentProduct] = evaluate((node as UpdateStatement).value as Expression, context, product);
  if (value.type === ObjectType.Error) {
    return [value, currentContext, currentProduct];
  }
  if ((node as UpdateStatement).name === null) { // parser won't let this happen
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `Variable name is missing.`,
        line: (node as UpdateStatement).token.line,
        column: (node as UpdateStatement).token.column
      }),
      currentContext,
      currentProduct
    ];
  }
  const key = ((node as UpdateStatement).name as Identifier).value;
  let tempContext: Context|null = currentContext;
  while (tempContext !== null) {
    if (tempContext.symbols.hasOwnProperty(key)) {
      tempContext.symbols[key] = value;
      break;
    }
    tempContext = tempContext.parent;
  }
  if (tempContext === null) {
    return [
      createErrorObject({
        type: ErrorType.UndeclaredVariableError,
        message: `Variable is not declared.`,
        line: ((node as UpdateStatement).name as Identifier).token.line,
        column: ((node as UpdateStatement).name as Identifier).token.column
      }),
      currentContext,
      currentProduct
    ];
  }
  return [value, currentContext, currentProduct];
}

// AttributeStatement
export function evalAttributeStatement (node: AttributeStatement, context: Context, product: Product): [ObjectInterface, Context, Product] {
  const key = node.name.value; // TODO: no need for check here, since parser makes sure this.
  const [result, currentContext, currentProduct] = evaluate((node as AttributeStatement).value as Expression, context, product);
  if (result.type === ObjectType.Error) {
    return [result, currentContext, currentProduct];
  }
  if (result.type !== ObjectType.Int && result.type !== ObjectType.Float) {
    return [
      createErrorObject({
        type: ErrorType.TypeError,
        message: `Wrong type for attributes.`,
        line: (node as UpdateStatement).value?.token?.line,
        column: (node as UpdateStatement).value?.token?.column
      }),
      currentContext,
      currentProduct
    ];
  }
  return [
    createAttributeObject(key, (result as IntegerObject|FloatObject).value),
    currentContext,
    currentProduct
  ];
}

// SizeExpression
export function evalSizeExpression (node: SizeExpression, context: Context, product: Product): [ObjectInterface, Context, Product] {
  if (product.size) {
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `nested 'size' is not allowed.`,
        line: node.token.line,
        column: node.token.column
      }),
      context,
      product
    ];
  }
  let missingAttribute = '';
  if (node.width === null) {
    missingAttribute = 'width';
  }
  if (node.height === null) {
    missingAttribute = 'height';
  }
  if (missingAttribute) {
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `Attribute '${missingAttribute}' is missing for 'size'.`,
        line: node.token.line,
        column: node.token.column
      }),
      context,
      product
    ];
  }
  let width: ObjectInterface = createNullObject();
  let height: ObjectInterface = createNullObject();
  let result: ObjectInterface = createNullObject();
  let currentContext = context;
  let currentProduct = product;
  [width, currentContext, currentProduct] = evaluate(node.width as AttributeStatement, currentContext, currentProduct);
  if (width.type === ObjectType.Error) {
    return [width, currentContext, currentProduct];
  }
  [height, currentContext, currentProduct] = evaluate(node.height as AttributeStatement, currentContext, currentProduct);
  if (height.type === ObjectType.Error) {
    return [height, currentContext, currentProduct];
  }
  let scopedContext = createContext(currentContext);
  currentProduct.size = `id size, width ${(width as IntegerObject|FloatObject).value}, height ${(height  as IntegerObject|FloatObject).value}`;
  currentProduct.currentScope = 'size';
  [result, scopedContext, currentProduct] = evaluate(node.statement as BlockStatement, scopedContext, currentProduct);
  currentContext = scopedContext.parent || currentContext;
  scopedContext.parent = null;
  return [result, currentContext, currentProduct];
}

// TagExpression
export function evalTagExpression (node: TagExpression, context: Context, product: Product): [ObjectInterface, Context, Product] {
  const tag: { [key: string]: number|string } = {
    tag: node.name
  };
  let result: ObjectInterface = createNullObject();
  let currentContext = context;
  let currentProduct = product;
  for (const attribute of node.attributes) {
    [result, currentContext, currentProduct] = evaluate(attribute, currentContext, currentProduct);
    if (result.type === ObjectType.Error) {
      return [result, currentContext, currentProduct];
    }
    if (result.type === ObjectType.Attribute) {
      // TODO: validate attribute keys
      tag[(result as AttributeObject).key] = (result as AttributeObject).value;
    }
  }
  if (!currentProduct.size || !currentProduct.currentScope) {
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `${tag.tag} can only be used inside 'size'.`,
        line: node.token.line,
        column: node.token.column
      }),
      currentContext,
      currentProduct
    ];
  }
  const id = currentProduct.grid.length.toString();
  currentProduct.grid.push(
    Object.keys(tag).reduce(
      (res: string, key: string) => `${res}, ${key} ${tag[key]}`,
      `id ${id}, parent ${currentProduct.currentScope}`
    )
  );
  if (tag.tag === 'group') { // only group can have children
    const currentScope = currentProduct.currentScope;
    let scopedContext = createContext(currentContext);
    currentProduct.currentScope = id;
    [result, scopedContext, currentProduct] = evaluate(node.statement as BlockStatement, scopedContext, currentProduct);
    currentContext = scopedContext.parent || currentContext;
    scopedContext.parent = null;
    currentProduct.currentScope = currentScope;
  } else if (node.statement && node.statement.statements && node.statement.statements.length > 0) {
    return [
      createErrorObject({
        type: ErrorType.SyntaxError,
        message: `Statements are not allowed to put inside ${tag.tag}.`,
        line: node.statement.token.line,
        column: node.statement.token.column
      }),
      currentContext,
      currentProduct
    ];
  }
  return [result, currentContext, currentProduct];
}

// Program
export function evalProgram (program: Program, context: Context, product: Product): [ObjectInterface, Context, Product] {
  let result: ObjectInterface = createNullObject();
  let currentContext: Context = context;
  let currentProduct: Product = product;
  for (const statement of program.statements) {
    [result, currentContext, currentProduct] = evaluate(statement, currentContext, currentProduct);
    if (result.type === ObjectType.Error) {
      return [result, currentContext, currentProduct];
    }
  }
  return [result, currentContext, currentProduct];
}

export function evaluate (node: Node, context?: Context, product?: Product): [ObjectInterface, Context, Product] {
  const clonedContext = cloneContext(context || createContext());
  const clonedProduct = cloneProduct(product || createProduct());

  switch (node.type) {
    // Program
    case NodeType.Program:
      return evalProgram((node as Program), clonedContext, clonedProduct);
    // Statement
    case NodeType.ExpressionStatement:
      return evaluate((node as ExpressionStatement).expression as Node, clonedContext, clonedProduct);

    // Integer
    case NodeType.Integer:
      return [createIntegerObject((node as IntegerLiteral).value), clonedContext, clonedProduct];
    // Float
    case NodeType.Float:
      return [createFloatObject((node as FloatLiteral).value), clonedContext, clonedProduct];
    // Boolean
    case NodeType.Boolean:
      return [createBooleanObject((node as BooleanLiteral).value), clonedContext, clonedProduct];

    // Prefix Expression
    case NodeType.PrefixExpression: {
      const [right, currentContext, currentProduct] = evaluate((node as PrefixExpression).right as Node, clonedContext, clonedProduct);
      if (right.type === ObjectType.Error) {
        return [right, currentContext, currentProduct];
      } else if (right.type === ObjectType.Null) {
        return [
          createErrorObject({
            type: ErrorType.UnknownError,
            message: `Unknown Error (PrefixExpression)`,
            line: (node as PrefixExpression).token.line,
            column: (node as PrefixExpression).token.column
          }),
          currentContext,
          currentProduct
        ];
      }
      const obj = evalPrefixExpression((node as PrefixExpression).operator, right as IntegerObject|FloatObject|BooleanObject);
      if (obj.type === ObjectType.Error) {
        const error = (obj as ErrorObject).value;
        switch (error.type) {
          case ErrorType.SyntaxError:
            error.column = (node as PrefixExpression).token.column;
            error.line = (node as PrefixExpression).token.line;
            break;
          case ErrorType.TypeError:
            error.column = (node as PrefixExpression).right?.token?.column;
            error.line = (node as PrefixExpression).right?.token?.line;
            break;
        }
      }
      return [
        obj,
        currentContext,
        currentProduct
      ];
    }

    // Infix Expression
    case NodeType.InfixExpression: {
      const [left, currentContext, currentProduct] = evaluate((node as InfixExpression).left as Node, clonedContext, clonedProduct);
      if (left.type === ObjectType.Error) {
        return [left, currentContext, currentProduct];
      }
      const [right, updatedCurrentContext, updatedCurrentProduct] = evaluate((node as InfixExpression).right as Node, currentContext, currentProduct);
      if (right.type === ObjectType.Error) {
        return [right, updatedCurrentContext, updatedCurrentProduct];
      }
      const obj = evalInfixExpression((node as InfixExpression).operator, left, right);
      if (obj.type === ObjectType.Error) {
        const error = (obj as ErrorObject).value;
        switch (error.type) {
          case ErrorType.SyntaxError:
            error.column = (node as InfixExpression).token.column;
            error.line = (node as InfixExpression).token.line;
            break;
          case ErrorType.TypeError:
            error.column = (node as InfixExpression).left?.token?.column;
            error.line = (node as InfixExpression).left?.token?.line;
            break;
        }
      }
      return [
        obj,
        updatedCurrentContext,
        updatedCurrentProduct
      ];
    }

    // Identifier
    case NodeType.Identifier: {
      let currentContext: Context|null = clonedContext;
      const key = (node as Identifier).value;
      while (currentContext !== null) {
        if (currentContext.symbols.hasOwnProperty(key)) {
          break;
        }
        currentContext = currentContext.parent;
      }
      return [
        (currentContext && currentContext.symbols[key])
          ? { ...currentContext.symbols[key] }
          : createErrorObject({
            type: ErrorType.NoValueAssignedError,
            message: `'${key}' has no value assigned.`,
            line: (node as Identifier).token.line,
            column: (node as Identifier).token.column
          }),
        clonedContext,
        clonedProduct
      ];
    }

    // SetStatement
    case NodeType.SetStatement:
      return evalSetStatement(node as SetStatement, clonedContext, clonedProduct);

    // UpdateStatement
    case NodeType.UpdateStatement:
      return evalUpdateStatement(node as UpdateStatement, clonedContext, clonedProduct);

    // BlockStatement
    case NodeType.BlockStatement:
      return evalBlockStatement(node as BlockStatement, clonedContext, clonedProduct);

    // IfExpression
    case NodeType.IfExpression:
      return evalIfExpression(node as IfExpression, clonedContext, clonedProduct);

    // Repeat
    case NodeType.RepeatExpression:
      return evalRepeatExpression(node as RepeatExpression, clonedContext, clonedProduct);

    // Size
    case NodeType.SizeExpression:
      return evalSizeExpression(node as SizeExpression, clonedContext, clonedProduct);

    // Tag
    case NodeType.TagExpression:
      return evalTagExpression(node as TagExpression, clonedContext, clonedProduct);

    // Attribute
    case NodeType.Attribute:
      return evalAttributeStatement(node as AttributeStatement, clonedContext, clonedProduct);

    default:
      return [
        createErrorObject({
          type: ErrorType.SyntaxError,
          message: `Unknown syntax.`,
          line: node.token?.line,
          column: node.token?.column
        }),
        clonedContext,
        clonedProduct
      ];
  }
}
