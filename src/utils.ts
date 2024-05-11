/* eslint-disable @typescript-eslint/no-type-alias */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

type Constructor = new (...args: any[]) => {};

export function applyMixins(derivedCtor: Constructor, constructors: Constructor[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ??
          Object.create(null)
      );
    });
  });
}
