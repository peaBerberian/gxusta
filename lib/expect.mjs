import { deepEqual, isSpiedFunction, signalError } from "./utils.mjs";

export default function expect(element) {
  return checkingObject(element, false);
}
function checkingObject(element, reverse) {
  return {
    get not() {
      return checkingObject(element, !reverse);
    },

    toBe(val) {
      const check = Object.is(val, element);
      if (reverse ? check : !check) {
        signalError(
          `Expected value to equal ${val} but it was equal to ${element}`,
        );
      }
    },

    toEqual(val) {
      const check = element === val || deepEqual(element, val);
      if (reverse ? check : !check) {
        signalError(`Expected ${element} to deep equal ${val}.`);
      }
    },

    toBeGreaterThan(val) {
      const check = element > val;
      if (reverse ? check : !check) {
        signalError(`Expected ${element} to be greater than ${val}.`);
      }
    },

    toBeGreaterOrEqualThan(val) {
      const check = element >= val;
      if (reverse ? check : !check) {
        signalError(`Expected ${element} to be greater or equal than ${val}`);
      }
    },

    toBeLesserThan(val) {
      const check = element < val;
      if (reverse ? check : !check) {
        signalError(`Expected ${element} to be less than ${val}.`);
      }
    },

    toBeLesserOrEqualThan(val) {
      const check = element <= val;
      if (reverse ? check : !check) {
        signalError(`Expected ${element} to be less or equal than ${val}`);
      }
    },

    toHaveBeenCalled() {
      if (!isSpiedFunction(element)) {
        signalError(
          "Expected element to have been called but it's not a spied function",
        );
      }
      const check = element.___TESTER_FN_OBJ.stats.calls.length > 0;
      if (reverse ? check : !check) {
        signalError(
          `Expected function "${element.___TESTER_FN_OBJ.name}" to have been called but it was never called`,
        );
      }
    },

    toHaveBeenCalledTimes(timeNb) {
      if (!isSpiedFunction(element)) {
        signalError(
          "Expected element to have been called but it's not a spied function",
        );
      }
      const check = element.___TESTER_FN_OBJ.stats.calls.length === timeNb;
      if (reverse ? check : !check) {
        signalError(
          `Expected function "${element.___TESTER_FN_OBJ.name}" to have been called ${timeNb} time(s) but it was called ${element.___TESTER_FN_OBJ.stats.calls.length} time(s).`,
        );
      }
    },

    toHaveBeenCalledWith(...args) {
      if (!isSpiedFunction(element)) {
        signalError(
          "Expected element to have been called but it's not a spied function",
        );
      }

      for (const call of element.___TESTER_FN_OBJ.stats.calls) {
        if (deepEqual([...args], [...call.args])) {
          if (reverse) {
            signalError(
              `Expected function "${element.___TESTER_FN_OBJ.name}" not to have been called with specific arguments, but it was not.`,
            );
          } else {
            return;
          }
        }
      }
      if (!reverse) {
        signalError(
          `Expected function "${element.___TESTER_FN_OBJ.name}" to have been called with specific arguments, but it was not.`,
        );
      }
    },

    toHaveBeenNthCalledWith(nth, ...args) {
      if (!isSpiedFunction(element)) {
        signalError(
          "Expected element to have been called but it's not a spied function",
        );
      }

      if (typeof nth !== "number") {
        signalError(
          "Value given to `toHaveBeenNthCalledWith` is not a number.",
        );
      }

      if (Number.isNaN(nth)) {
        signalError("Value given to `toHaveBeenNthCalledWith` is NaN.");
      }

      if (nth < 0) {
        signalError(
          `Value given to \`toHaveBeenNthCalledWith\` is negative: ${nth}.`,
        );
      }

      if (nth >= element.___TESTER_FN_OBJ.stats.calls.length) {
        signalError(
          "Expected element to have been called at least " +
            String(nth + 1) +
            (nth === 0 ? "time" : "times") +
            "but it was called " +
            String(element.___TESTER_FN_OBJ.stats.calls.length) +
            (element.___TESTER_FN_OBJ.stats.calls.length <= 1
              ? "time"
              : "times."),
        );
      }
      if (
        deepEqual([...args], [...element.___TESTER_FN_OBJ.stats.calls[nth]])
      ) {
        if (reverse) {
          signalError(
            `Expected function "${element.___TESTER_FN_OBJ.name}" not to have been called with specific arguments, but it was not.`,
          );
        } else {
          return;
        }
      }
      if (!reverse) {
        signalError(
          `Expected function "${element.___TESTER_FN_OBJ.name}" to have been called with specific arguments, but it was not.`,
        );
      }
    },
  };
}
