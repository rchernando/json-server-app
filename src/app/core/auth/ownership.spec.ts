import { describe, it, expect } from 'vitest';
import { canUserManage } from './ownership';

describe('canUserManage', () => {
  const alice = { id: 1, name: 'alice', email: 'a@a.com' };
  const bruno = { id: 2, name: 'bruno', email: 'b@b.com' };

  it('should return true when the user owns the resource', () => {
    expect(canUserManage({ userId: 1 }, alice)).toBe(true);
  });

  it('should return false when the user does not own the resource', () => {
    expect(canUserManage({ userId: 2 }, alice)).toBe(false);
  });

  it('should return false when there is no user', () => {
    expect(canUserManage({ userId: 1 }, null)).toBe(false);
  });

  it('should return false when there is no resource', () => {
    expect(canUserManage(null, alice)).toBe(false);
    expect(canUserManage(undefined, alice)).toBe(false);
  });

  it('should work with comments too', () => {
    expect(canUserManage({ userId: 2 }, bruno)).toBe(true);
    expect(canUserManage({ userId: 2 }, alice)).toBe(false);
  });
});
