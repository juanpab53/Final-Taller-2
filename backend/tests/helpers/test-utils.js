import { vi } from 'vitest';

export function makeRes() {
  const res = {
    statusCode: undefined,
    body: undefined,
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  };
  res.status = vi.fn((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((payload) => {
    res.body = payload;
    return res;
  });
  return res;
}

export function makeReq(overrides = {}) {
  return {
    headers: {},
    query: {},
    params: {},
    body: {},
    cookies: {},
    user: { id: 'user-1', email: 'a@b.com', role: 'CLIENT' },
    ...overrides,
  };
}

export function fakeTokenService(overrides = {}) {
  return {
    signAccessToken: vi.fn(),
    signRefreshToken: vi.fn(),
    verifyAccessToken: vi.fn(),
    verifyRefreshToken: vi.fn(),
    ...overrides,
  };
}
