/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-type-alias */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { z } from "zod";

type Constructor = new (...args: any[]) => {};

/**
 * Apply mixins to a class
 * @see https://www.typescriptlang.org/docs/handbook/mixins.html
 */
export function applyMixins(derivedCtor: Constructor, constructors: Constructor[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
        ?? Object.create(null),
      );
    });
  });
}

/**
 * Method for validating zod schema with interface
 * @see https://github.com/colinhacks/zod/issues/372#issuecomment-1280054492
 */
export type Implements<Model> = {
  [key in keyof Model]-?: undefined extends Model[key]
    ? null extends Model[key]
      ? z.ZodNullableType<z.ZodOptionalType<z.ZodType<Model[key]>>>
      : z.ZodOptionalType<z.ZodType<Model[key]>>
    : null extends Model[key]
      ? z.ZodNullableType<z.ZodType<Model[key]>>
      : z.ZodType<Model[key]>;
};

/**
 * Utility function for implementing zod schema with interface
 * @see https://github.com/colinhacks/zod/issues/372#issuecomment-1280054492
 */
export function implement<Model = never>() {
  return {
    with: <
      Schema extends Implements<Model> & {
        [unknownKey in Exclude<keyof Schema, keyof Model>]: never;
      },
    >(
      schema: Schema,
    ) => z.object(schema),
  };
}
