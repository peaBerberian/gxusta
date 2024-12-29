import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import expect from "./expect.mjs";
import { signalError } from "./utils.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export { expect };
const allTests = [];
let currentCollection = null;

function createEmptyTestCollectionObject(title) {
  return {
    type: "collection",
    beforeAll: [],
    afterAll: [],
    beforeEach: [],
    afterEach: [],
    title,
    content: [],
  };
}

export function describe(title, implementation) {
  let prevCollection = currentCollection;
  currentCollection = createEmptyTestCollectionObject(title);
  if (prevCollection !== null) {
    prevCollection.content.push(currentCollection);
  }
  allTests.push(currentCollection);
  implementation();
  currentCollection = null;
}

export function test(title, implementation) {
  if (currentCollection !== null) {
    currentCollection.content.push({
      type: "test",
      parentCollection: currentCollection,
      title,
      implementation,
    });
  } else {
    allTests.push({
      type: "test",
      parentCollection: null,
      title,
      implementation,
    });
  }
}

export const it = test;

export function beforeAll(fn) {
  if (currentCollection === null) {
    currentCollection = createEmptyTestCollectionObject();
  }
  currentCollection.beforeAll.push(fn);
}
export function beforeEach(fn) {
  if (currentCollection === null) {
    currentCollection = createEmptyTestCollectionObject();
  }
  currentCollection.beforeEach.push(fn);
}
export function afterAll(fn) {
  if (currentCollection === null) {
    currentCollection = createEmptyTestCollectionObject();
  }
  currentCollection.afterAll.push(fn);
}
export function afterEach(fn) {
  if (currentCollection === null) {
    currentCollection = createEmptyTestCollectionObject();
  }
  currentCollection.afterEach.push(fn);
}

export default async function run() {
  const failures = [];
  const successes = [];
  for (const item of allTests) {
    await runCollection(item, { successes, failures });
  }
  console.log("\nDone!");
  console.log(`${successes.length} tests succeeded.`);
  console.log(`${failures.length} tests failed.`);
}

async function runCollection(element, { successes, failures }) {
  if (element.type === "collection") {
    if (element.title !== undefined) {
      console.log("-> " + element.title + ":");
    }
    for (const beforeAll of element.beforeAll) {
      await beforeAll();
    }
  }

  if (element.type === "test") {
    if (
      element.parentCollection &&
      element.parentCollection.beforeEach !== undefined
    ) {
      for (const beforeEach of element.parentCollection.beforeEach) {
        await beforeEach();
      }
    }
    try {
      await element.implementation();
      successes.push(element);
      console.log("  V", element.title);
    } catch (err) {
      failures.push({
        test: element,
      });
      console.log("  E", element.title);
      if (err instanceof Error) {
        let foundLocation = false;
        if (typeof err.stack === "string") {
          // TODO: better check. RegExp-based?
          const stackLines = err.stack.split("\n");
          for (const stackLine of stackLines) {
            const trimmed = stackLine.trim();
            if (trimmed.startsWith("Error:")) {
              continue;
            }
            if (trimmed.startsWith("at") && trimmed.indexOf("(file://") > 0) {
              if (trimmed.indexOf(__dirname) > 0) {
                continue;
              }
              console.error("REJECTED:", err.message);
              console.error("LOCATION:", trimmed);
              // TODO: read source file to show where the issue is
              foundLocation = true;
              break;
            }
          }
        }
        if (!foundLocation) {
          console.error("Rejected:", err);
        }
      }
    }
    if (
      element.parentCollection &&
      element.parentCollection.beforeEach !== undefined
    ) {
      for (const afterEach of element.parentCollection.afterEach) {
        await afterEach();
      }
    }
  }

  if (element.content) {
    if (element.content.length === 0 && element.type === "collection") {
      console.log("  no test");
    }
    for (const item of element.content) {
      await runCollection(item, { successes, failures });
    }
  }
  if (element.type === "collection") {
    for (const afterAll of element.afterAll) {
      await afterAll();
    }
  }
}

export function setUpJsMockFiles(filePath, obj) {
  // TODO: The `mock.js` file is the target of what should be created in a first
  // pass

  // The following code is intended to be run in a second pass, in the same env
  // than tests.

  const ret = {};
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (obj[key] === "function") {
      const fnStats = globalThis.___TESTER["fileHashId"][key];
      if (fnStats === undefined || fnStats.type !== "function") {
        signalError(
          `Unknown Exported function: "${key}" for the file "${filePath}"`,
        );
      }
      ret[key] = createTesterSpyObject(key, fnStats);
    }
  }
  return ret;
}

function createTesterSpyObject(fnName, stats) {
  return {
    ___TESTER_FN_OBJ: {
      name: fnName,
      stats,
    },
    mockImplementation(newImplem) {
      stats.currentImplementation = newImplem;
      return this;
    },
    mockRestore() {
      stats.restore();
      return this;
    },
    mockRemove() {
      stats.restore();
      return this;
    },
    mockReset() {
      stats.calls.length = 0;
      return this;
    },
  };
}

export function spyOn(obj, fnName) {
  if (obj === undefined || obj === null) {
    signalError("Error: cannot spy on given object");
  }
  if (typeof obj[fnName] !== "function") {
    signalError("Error: cannot spy on something that is not a function");
  }

  const previousImplem = obj[fnName];
  const stats = {
    type: "function",
    baseImplementation: previousImplem,
    currentImplementation: previousImplem,
    restore() {
      stats.currentImplementation = previousImplem;
    },
    remove() {
      obj[fnName] = previousImplem;
    },
    calls: [],
  };
  const spy = createSpiedFn(stats);
  obj[fnName] = function () {
    return spy.apply(this, arguments);
  };
  return createTesterSpyObject(fnName, stats);
}

export function createGlobalSpy(fnName, fileHash, baseImports) {
  if (fileHash !== undefined) {
    globalThis.___TESTER = globalThis.___TESTER ?? {};
    globalThis.___TESTER[fileHash] = globalThis.___TESTER[fileHash] ?? {};
  }

  const originalImplem =
    baseImports === undefined
      ? () => {
          /* noop */
        }
      : baseImports[fnName];

  let called;
  const stats = {
    type: "function",
    baseImplementation: originalImplem,
    currentImplementation: originalImplem,
    restore() {
      stats.currentImplementation = originalImplem;
    },
    remove() {
      called = originalImplem;
    },
    calls: [],
  };
  called = createSpiedFn(stats);

  if (fileHash !== undefined) {
    globalThis.___TESTER[fileHash][fnName] = stats;
  }

  return function () {
    return called.apply(this, arguments);
  };
}

export function createSpiedFn(stats) {
  return function () {
    let ret;
    const callInfo = {
      args: arguments,
      status: "pending",
      error: null,
      ret: null,
      hasPromise: false,
      resolved: undefined,
      rejected: undefined,
    };
    stats.calls.push(callInfo);
    try {
      ret = stats.currentImplementation.apply(this, arguments);
    } catch (err) {
      callInfo.status = "error";
      callInfo.error = err;
      throw err;
    }
    callInfo.status = "finished";
    callInfo.ret = ret;
    if (
      typeof ret === "object" &&
      ret !== null &&
      typeof ret.then === "function" &&
      typeof ret.catch === "function"
    ) {
      callInfo.hasPromise = true;
      ret.then(
        (val) => {
          callInfo.resolved = val;
        },
        (err) => {
          callInfo.rejected = err;
        },
      );
    }
    return ret;
  };
}

// const mockA = tester.setUpJsMockFiles(["./a.mjs"]);
// mockA.setExportedFunction("subtract", (x, y) => {
//   return x + y;
// });

// How it works:
//
// When calling `setUpJsMockFile`, we will first execute the given JavaScript
// file to identify what it exports, and then replace that file with another
// which has all those exports mocked instead.
//
// To give a simplified example, if you add on top of your test file:
// ```js
// testr.setUpJsMockFile("./example.js")
// ```
//
// And you have the following `./example.js` file:
// ```js
// // example.js
//
// export default function add(x, y) {
//   return x + y;
// }
//
// export function subtract(x, y) {
//   return x - y;
// }
//
// export const value = 4;
// export const obj = {
//   foo: 5,
// };
// ```
//
// We will run that file initially, identify its exports, and then replace that
// file with something like:
// ```js
// export default mockedAdd(x, y) {
// }
//
// export function subtract() {
// }
//
// export const value = 4;
// export const obj = {
//   foo: 5,
// }
// ```
//
// Notice that the mocked functions do not do anything first. If you need them
// when testing, you're supposed to mock them explicitely in your test file by
// calling:
// ```js
// // For the named export "subtract"
// testr.setExportedFunction("subtract", )
// ```
//
// TODO: we could also just return original implems in mock files as a default I
// guess.
