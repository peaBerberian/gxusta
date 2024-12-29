import { createGlobalSpy } from "../lib/index.mjs";
import * as imports from "./example.mjs";

const subtract = createGlobalSpy("subtract", "fileHashId", imports);
const defaultFn = createGlobalSpy("default", "fileHashId", imports);
export { subtract };
export default defaultFn;
