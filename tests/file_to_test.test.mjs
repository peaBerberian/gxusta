import {
  beforeEach,
  describe,
  expect,
  it,
  setUpJsMockFiles,
  spyOn,
} from "../lib/index.mjs";
import { performOperations, fns } from "./file_to_test.mjs";

// TODO: This should move example.mjs elsewhere and create the `mock.mjs` file
// in its place
const mock = setUpJsMockFiles("./example.mjs", {
  default: "function",
  subtract: "function",
});

describe("first describe", () => {
  beforeEach(() => {
    mock.default.mockReset();
    mock.subtract.mockReset();
  });

  it("should be able to mock", () => {
    mock.default.mockImplementation((a, b) => {
      return a * b;
    });

    const mulSpy = spyOn(fns, "mul").mockImplementation((a, b) => {
      return a / b;
    });

    const res1 = performOperations(4, 3);
    expect(res1.add).toEqual(4 * 3);
    expect(res1.subtract).toEqual(1);
    expect(res1.mul).toEqual(4 / 3);

    expect(mock.default).toHaveBeenCalledTimes(1);
    expect(mock.subtract).toHaveBeenCalledTimes(1);
    expect(mulSpy).toHaveBeenCalledTimes(1);

    mock.default.mockRestore();
    mock.subtract.mockRestore();
    mulSpy.mockRestore();

    const res2 = performOperations(4, 3);
    expect(res2.add).toEqual(7);
    expect(res2.subtract).toEqual(1);
    expect(res2.mul).toEqual(12);

    expect(mock.default).toHaveBeenCalledTimes(2);
    expect(mock.subtract).toHaveBeenCalledTimes(2);
    expect(mulSpy).toHaveBeenCalledTimes(2);
  });

  it("should be able to just spy", () => {
    const mulSpy = spyOn(fns, "mul");
    const res1 = performOperations(4, 3);
    expect(res1.add).toEqual(7);
    expect(res1.subtract).toEqual(1);
    expect(res1.mul).toEqual(12);
    expect(mock.default).toHaveBeenCalledTimes(1);
    expect(mock.subtract).toHaveBeenCalledTimes(1);
    expect(mulSpy).toHaveBeenCalledTimes(1);
  });

  it("should be able to mock", () => {
    mock.default.mockImplementation((a, b) => {
      return a * b;
    });

    const mulSpy = spyOn(fns, "mul").mockImplementation((a, b) => {
      return a / b;
    });

    const res1 = performOperations(4, 3);
    expect(res1.add).toEqual(4 * 3);
    expect(res1.subtract).toEqual(1);
    expect(res1.mul).toEqual(4 / 3);

    expect(mock.default).toHaveBeenCalledTimes(1);
    expect(mock.subtract).toHaveBeenCalledTimes(1);
    expect(mulSpy).toHaveBeenCalledTimes(1);
    expect(mulSpy).toHaveBeenCalledWith(4, 3);
    expect(mulSpy).toHaveBeenCalledWith(5, 3);

    mock.default.mockRestore();
    mock.subtract.mockRestore();
    mulSpy.mockRestore();

    const res2 = performOperations(4, 3);
    expect(res2.add).toEqual(7);
    expect(res2.subtract).toEqual(1);
    expect(res2.mul).toEqual(12);

    expect(mock.default).toHaveBeenCalledTimes(2);
    expect(mock.subtract).toHaveBeenCalledTimes(2);
    expect(mulSpy).toHaveBeenCalledTimes(2);
  });

  it("Promise resolving", () => {
    return Promise.resolve();
  });

  it("Promise rejecting", () => {
    // return Promise.reject(new Error("some error"));
  });
});

describe("second describe", () => {
  describe("Contained describe", () => {
    it("contained test", () => {});
  });
});
describe("third empty describe", () => {});
