import add, { subtract } from "./mock.mjs";

export const fns = {
  mul(a, b) {
    return a * b;
  },
};

export function performOperations(a, b) {
  return {
    add: add(a, b),
    subtract: subtract(a, b),
    mul: fns.mul(a, b),
  };
}
