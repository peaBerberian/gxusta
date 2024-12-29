export function isSpiedFunction(element) {
  return (
    // typeof element === "function" &&
    typeof element.___TESTER_FN_OBJ === "object" &&
    element.___TESTER_FN_OBJ !== null
  );
}

export function signalError(msg, shouldThrow = true) {
  if (shouldThrow) {
    const err = new Error(msg);
    // console.log(err.stack);
    throw err;
  }
  console.error(msg);
}

export function deepEqual(obj1, obj2) {
  if (obj1 === obj2) {
    return true;
  }

  if (isPrimitive(obj1) && isPrimitive(obj2)) {
    return obj1 === obj2;
  }

  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }

  for (let key in obj1) {
    if (!(key in obj2)) {
      return false;
    }
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

function isPrimitive(obj) {
  return obj !== Object(obj);
}
