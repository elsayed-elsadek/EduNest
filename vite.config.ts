import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

export default defineConfig({
  plugins: [
    react(),
    // إضافة أداة ضغط الصور تلقائياً عند عمل Build
    ViteImageOptimizer({
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      includePublic: true,
      logStats: true,
      ansiColors: true,
      svg: {
        multipass: true,
      },
      png: { quality: 75 },
      jpeg: { quality: 75 },
      webp: { quality: 70 },
      avif: { quality: 70 },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  },
  build: {
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    target: 'esnext',
    // تفعيل ضغط Brotli لتحسين الأداء
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // تقسيم المكتبات الكبيرة لملفات منفصلة لتقليل وقت التحميل الأول
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core - تحميل سريع
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Charts - تحميل كسول
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            // UI Components - Lucide icons (tree-shakeable)
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            // FontAwesome - تحميل منفصل لتقليل الحجم
            if (id.includes('@fortawesome')) {
              return 'vendor-fontawesome';
            }
            // Headless UI
            if (id.includes('@headlessui')) {
              return 'vendor-ui';
            }
            // State & Data
            if (id.includes('axios') || id.includes('zustand') || id.includes('@tanstack')) {
              return 'vendor-misc';
            }
            // Video conferencing - تحميل كسول جداً
            if (id.includes('@jitsi')) {
              return 'vendor-jitsi';
            }
            // Alerts
            if (id.includes('sweetalert2')) {
              return 'vendor-alerts';
            }
            return 'vendor';
          }
        },
        // تحسين أسماء الملفات للـ caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'zustand'],
    exclude: ['@jitsi/react-sdk'],
  },
  // تحسين وقت البناء
  cacheDir: 'node_modules/.vite',
});
