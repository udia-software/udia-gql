import { Kind, ValueNode } from "graphql";
import { GraphQLTypeLong } from "../../graphql/scalars";

describe("graphql/scalars.ts", () => {
  describe("Long", () => {
    it("should coerce long values appropriately", () => {
      expect.assertions(15);
      expect(GraphQLTypeLong.serialize("14")).toBe(14);
      // parseValue & serialize do the same thing
      expect(GraphQLTypeLong.parseValue("14.0")).toBe(14);
      // upper and lower bounds
      const maxNum = Number.MAX_SAFE_INTEGER;
      expect(GraphQLTypeLong.serialize(maxNum)).toBe(maxNum);
      expect(() => GraphQLTypeLong.serialize(maxNum + 1)).toThrowError("Number out of safe integer range");
      const minNum = Number.MIN_SAFE_INTEGER;
      expect(GraphQLTypeLong.serialize(minNum)).toBe(minNum);
      expect(() => GraphQLTypeLong.serialize(minNum - 1)).toThrowError("Number out of safe integer range");
      // some unusual edge cases
      expect(GraphQLTypeLong.serialize(null)).toBe(0);
      expect(GraphQLTypeLong.serialize([])).toBe(0);
      expect(GraphQLTypeLong.serialize([14])).toBe(14);
      expect(GraphQLTypeLong.serialize(["14"])).toBe(14);
      expect(GraphQLTypeLong.serialize(["14.49"])).toBe(14);
      expect(GraphQLTypeLong.serialize(["13.5"])).toBe(14);
      // some failure cases
      expect(() => GraphQLTypeLong.serialize([1, 3])).toThrowError("Number out of safe integer range");
      expect(() => GraphQLTypeLong.serialize(undefined)).toThrowError("Number out of safe integer range");
      expect(() => GraphQLTypeLong.serialize({})).toThrowError("Number out of safe integer range");
    });

    it("should parse long literals appropriately", () => {
      expect.assertions(3);
      const ast: ValueNode = { kind: Kind.INT, value: "14" };
      expect(GraphQLTypeLong.parseLiteral(ast, undefined)).toBe(14);
      const badValueAst: ValueNode = { kind: Kind.INT, value: `${Number.MAX_SAFE_INTEGER + 1}` };
      expect(GraphQLTypeLong.parseLiteral(badValueAst, undefined)).toBe(null);
      const badTypeAst: ValueNode = { kind: Kind.STRING, value: "14" };
      expect(GraphQLTypeLong.parseLiteral(badTypeAst, undefined)).toBe(null);
    });
  });
});
