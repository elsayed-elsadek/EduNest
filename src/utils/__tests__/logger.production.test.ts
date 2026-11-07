import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Production behaviour is verified in its own file: the logger reads
 * `import.meta.env.DEV` once at module evaluation time, so the module has to be
 * imported again after the environment has been stubbed.
 */
describe('logger in production', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('never writes to the console when DEV is falsy', async () => {
    const spies = [
      vi.spyOn(console, 'debug').mockImplementation(() => undefined),
      vi.spyOn(console, 'info').mockImplementation(() => undefined),
      vi.spyOn(console, 'log').mockImplementation(() => undefined),
      vi.spyOn(console, 'warn').mockImplementation(() => undefined),
      vi.spyOn(console, 'error').mockImplementation(() => undefined),
    ];

    vi.stubEnv('DEV', false);
    vi.stubEnv('VITE_API_BASE_URL', 'https://unit-test-api.example.com');
    vi.stubEnv('VITE_CHATBOT_API_URL', 'https://unit-test-chat.example.com/chat');
    vi.resetModules();
    const { default: productionLogger } = await import('../logger');

    productionLogger.debug('debug');
    productionLogger.info('info');
    productionLogger.log('log');
    productionLogger.warn('warn');
    productionLogger.error('error', { password: 'hunter2' });

    for (const spy of spies) {
      expect(spy).not.toHaveBeenCalled();
    }
  });
});
