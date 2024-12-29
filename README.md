# ĝusta

`ĝusta` is a work-in-progress testing framework mostly motivated by the
prototyping of ideas of what my ideal testing framework could be.

I'm taking as a base the Jasmine/Jest/vitest-type assertion/mocking API (e.g.
`expect(x).toBeGreaterThan(n)`, `spyOn(obj, "method")` etc.) as well as the
usual `describe`, `it`, `afterEach` etc. test running functions.

My goal is to first implement that common approach to then discover what I would
do for the more framework-specific stuff: file-mocking, test running on
browser/node.js, reporting etc.

I have no real intent of using this for my own projects, it's mostly made so I
better understand that subject.

## Done / TODO

- [x] basic lifecycle API: `describe`, `it`, `beforeEach`, `beforeAll`,
      `afterEach`, `afterAll`.

- [x] Assertion basics: `toBe`, `toEqual`, `toBeGreaterThan`, `toBeGreaterThan`,
      `toBeGreaterOrEqualThan`, `toBeLesserThan`, `toBeLesserOrEqualThan`

- [x] `not` property to reverse assertion

- [x] `spyOn` function for spying on method

- [x] `spy` assertions basics: `toHaveBeenCalled`, `toHaveBeenCalledTimes`

- [x] `spy` assertions arguments: `toHaveBeenCalledWith`,
      `toHaveBeenNthCalledWith`

- [x] spy/mocks management basics: `mockImplementation`, `mockRestore`,
      `mockReset`, `mockRemove`

- [ ] `spyOn` function for spying on property access

- [ ] beautiful default progress reporting

- [ ] Useful test failures reports:

  - Maybe using the `stack` of thrown errors and cross referencing with the test
    file's corresponding assertion?

    Though in that case we may either not be able to transpile tests sources
    before running them or we may but would have to rely on sourcemaps.

  - Some colors in that terminal. Am I so weak I'll use `chalk` for this?

- [ ] File mocking. Current ideas, either:

  1. first pass which execute the original file to mock to see exports, rename
     that file and create on its original path a mock file importing those
     original exports with an added level of indirection to allow for
     spying/mocks.

  2. Replace, only when running the corresponding test file, the original file
     with a mocked version.

- [ ] optionally run in jsdom environment

- [ ] optionally run on local chrome/firefox/safari binaries

- [ ] configurable progress reporter

- [ ] optionally run with libs like playwright / webdriverio
