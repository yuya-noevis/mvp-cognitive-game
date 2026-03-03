import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDeviceInfo } from '@/features/assist-log/device-info';

describe('getDeviceInfo', () => {
  const originalWindow = global.window;
  const originalNavigator = global.navigator;

  afterEach(() => {
    // Restore to JSDOM defaults after each test
    vi.restoreAllMocks();
  });

  it('should return "unknown" in SSR environment', () => {
    // Temporarily make window undefined
    const windowDescriptor = Object.getOwnPropertyDescriptor(global, 'window');
    Object.defineProperty(global, 'window', { value: undefined, writable: true, configurable: true });

    expect(getDeviceInfo()).toBe('unknown');

    // Restore
    if (windowDescriptor) {
      Object.defineProperty(global, 'window', windowDescriptor);
    }
  });

  it('should return a non-empty string in browser environment', () => {
    const info = getDeviceInfo();
    expect(info).toBeTruthy();
    expect(typeof info).toBe('string');
  });

  it('should include device type', () => {
    const info = getDeviceInfo();
    // In JSDOM, the default user agent should match Desktop
    expect(info).toMatch(/Desktop|Mobile|Tablet/);
  });

  it('should include screen dimensions', () => {
    const info = getDeviceInfo();
    // JSDOM provides default screen dimensions
    expect(info).toMatch(/\d+x\d+/);
  });

  it('should detect Mobile user agent', () => {
    const originalUA = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      writable: true,
      configurable: true,
    });

    const info = getDeviceInfo();
    expect(info).toContain('Mobile');

    // Restore
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUA,
      writable: true,
      configurable: true,
    });
  });

  it('should detect Tablet user agent', () => {
    const originalUA = navigator.userAgent;
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      writable: true,
      configurable: true,
    });

    const info = getDeviceInfo();
    expect(info).toContain('Tablet');

    // Restore
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUA,
      writable: true,
      configurable: true,
    });
  });

  it('should separate parts with " / "', () => {
    const info = getDeviceInfo();
    const parts = info.split(' / ');
    // At minimum: device type + screen size
    expect(parts.length).toBeGreaterThanOrEqual(2);
  });
});
