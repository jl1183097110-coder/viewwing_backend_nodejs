import { vi } from "vitest";

type MockResult = any[] | undefined;

/**
 * Chainable mock for Drizzle ORM query builder
 * Methods return the mock object for chaining, which is thenable
 */
export function createMockDb() {
  let resultQueue: MockResult[] = [];
  let shouldThrow: Error | null = null;
  let callCount = 0;

  const mockQuery: any = {
    select: vi.fn(function(this: any) { return this; }),
    from: vi.fn(function(this: any) { return this; }),
    where: vi.fn(function(this: any) { return this; }),
    and: vi.fn(function(this: any) { return this; }),
    limit: vi.fn(function(this: any) { return this; }),
    offset: vi.fn(function(this: any) { return this; }),
    orderBy: vi.fn(function(this: any) { return this; }),
    returning: vi.fn(function(this: any) { return this; }),
    insert: vi.fn(function(this: any) { return this; }),
    values: vi.fn(function(this: any) { return this; }),
    update: vi.fn(function(this: any) { return this; }),
    set: vi.fn(function(this: any) { return this; }),
    delete: vi.fn(function(this: any) { return this; }),
    leftJoin: vi.fn(function(this: any) { return this; }),
    rightJoin: vi.fn(function(this: any) { return this; }),
    innerJoin: vi.fn(function(this: any) { return this; }),
    fullJoin: vi.fn(function(this: any) { return this; }),
  };

  // Make it thenable
  mockQuery.then = function(onFulfilled: any, onRejected: any) {
    if (shouldThrow) {
      const err = shouldThrow;
      shouldThrow = null; // consume throw so it fires only once
      return Promise.reject(err).catch(onRejected);
    }
    if (callCount >= resultQueue.length) {
      return Promise.reject(
        new Error(
          `dbMock: query #${callCount + 1} executed but only ${resultQueue.length} result(s) queued. ` +
            `Call mockDb.setResult(...) once per expected DB call.`,
        ),
      ).catch(onRejected);
    }
    const result = resultQueue[callCount];
    callCount++;
    return Promise.resolve(result).then(onFulfilled, onRejected);
  };

  const reset = () => {
    resultQueue = [];
    shouldThrow = null;
    callCount = 0;
    // Only clear mock functions (not 'then')
    const mockMethods = ['select', 'from', 'where', 'and', 'limit', 'offset', 'orderBy', 'returning', 'insert', 'values', 'update', 'set', 'delete', 'leftJoin', 'rightJoin', 'innerJoin', 'fullJoin'];
    mockMethods.forEach((method) => {
      (mockQuery[method] as any).mockClear();
    });
  };

  const setResult = (result: MockResult) => {
    resultQueue.push(result);
  };

  const setThrow = (error: Error) => {
    shouldThrow = error;
  };

  return {
    mock: mockQuery,
    reset,
    setResult,
    setThrow,
  };
}

// Global mock instance
const mockDb = createMockDb();

export { mockDb };
