import { GraphQLScalarType, Kind, ValueNode } from "graphql";

const coerceLong = (value: any) => {
  const num = Number(value);
  if (Number.MIN_SAFE_INTEGER <= num && num <= Number.MAX_SAFE_INTEGER) {
    return Math.round(num);
  }
  throw new TypeError("Number out of safe integer range");
};
const parseLongLiteral = (ast: ValueNode) => {
  if (ast.kind === Kind.INT) {
    const num = parseInt(ast.value, 10);
    if (Number.MIN_SAFE_INTEGER <= num && num <= Number.MAX_SAFE_INTEGER) {
      return num;
    }
  }
  return null;
};

/**
 * Custom Long Scalar due to GraphQL not supporting ints > 32bit
 */
export const GraphQLTypeLong = new GraphQLScalarType({
  name: "Long",
  description: "Javascript maximum safe integer",
  serialize: coerceLong,
  parseValue: coerceLong,
  parseLiteral: parseLongLiteral,
});
