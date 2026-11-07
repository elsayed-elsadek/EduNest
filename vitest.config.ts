import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/config/env.ts',
        'src/utils/jwt.ts',
        'src/utils/logger.ts',
        'src/routes/ProtectedRoute.tsx',
        'src/hooks/useLogin.ts',
        'src/hooks/useRegisterForm.ts',
        'src/components/common/Button.tsx',
        'src/components/common/EmptyState.tsx',
        'src/components/common/ErrorState.tsx',
      ],
      thresholds: {
        lines: 70,
        branches: 70,
      },
    },
  },
});
