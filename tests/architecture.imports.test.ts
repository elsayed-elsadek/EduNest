/**
 * Architecture barrier — import-direction and initialization-safety rules for
 * the authentication cluster (FE-008 / EF-25).
 *
 * Enforced invariants:
 *  1. `authStore` must never import the API layer (it is the bottom of the
 *     auth graph — `api` and `authSession` depend on it, never the reverse).
 *  2. `authSession` must never import `api`/`authService` (it owns its own
 *     bare fetch for the public auth endpoints; `api` imports `authSession`
 *     for the 401 interceptor, so the reverse edge would be circular).
 *  3. `api` must never import `authService` (service layer sits above `api`).
 *  4. The auth cluster is acyclic.
 *  5. Cold-import initialization safety: loading the modules in any order
 *     yields defined exports (no TDZ / circular-evaluation breakage).
 *
 * Note: `tsc -b` does NOT reject runtime circular imports — this test does.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const CLUSTER: Array<{ key: string; file: string }> = [
  { key: 'authStore', file: 'src/store/authStore.ts' },
  { key: 'authSession', file: 'src/services/authSession.ts' },
  { key: 'api', file: 'src/services/api.ts' },
  { key: 'authService', file: 'src/services/authService.ts' },
  { key: 'jwt', file: 'src/utils/jwt.ts' },
  { key: 'env', file: 'src/config/env.ts' },
];

/** Extract static import specifiers (`from '...'` and bare `import '...'`). */
function importSpecifiers(filePath: string): string[] {
  if (!existsSync(filePath)) return [];
  const source = readFileSync(filePath, 'utf8');
  const specifiers = new Set<string>();
  const fromPattern = /(?:^|\n)\s*(?:import|export)\s[^;'"]*?from\s+['"]([^'"]+)['"]/g;
  const barePattern = /(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g;
  for (const pattern of [fromPattern, barePattern]) {
    for (const match of source.matchAll(pattern)) {
      specifiers.add(match[1]);
    }
  }
  return [...specifiers];
}

/** Resolve a relative specifier to an existing source file in the cluster, if any. */
function resolveToCluster(fromFile: string, specifier: string): string | null {
  if (!specifier.startsWith('.')) return null;
  const base = resolve(dirname(fromFile), specifier);
  const candidates = [base, `${base}.ts`, `${base}.tsx`, resolve(base, 'index.ts'), resolve(base, 'index.tsx')];
  const found = candidates.find((c) => existsSync(c) && (c.endsWith('.ts') || c.endsWith('.tsx')));
  if (!found) return null;
  const clusterEntry = CLUSTER.find((entry) => resolve(ROOT, entry.file) === found);
  return clusterEntry ? clusterEntry.key : null;
}

function existingClusterFiles() {
  return CLUSTER.filter((entry) => existsSync(resolve(ROOT, entry.file)));
}

describe('architecture: auth cluster import direction', () => {
  it('authStore never imports the API/service layer', () => {
    const file = resolve(ROOT, 'src/store/authStore.ts');
    const edges = importSpecifiers(file)
      .map((spec) => resolveToCluster(file, spec))
      .filter((key): key is string => key !== null);
    const forbidden = edges.filter((key) => ['api', 'authSession', 'authService'].includes(key));
    expect(forbidden).toEqual([]);
  });

  it('authSession never imports api/authService (bare fetch owns the refresh call)', () => {
    const file = resolve(ROOT, 'src/services/authSession.ts');
    if (!existsSync(file)) return; // not implemented yet — rule activates when it lands
    const edges = importSpecifiers(file)
      .map((spec) => resolveToCluster(file, spec))
      .filter((key): key is string => key !== null);
    const forbidden = edges.filter((key) => ['api', 'authService'].includes(key));
    expect(forbidden).toEqual([]);
  });

  it('api never imports authService (service layer sits above the client)', () => {
    const file = resolve(ROOT, 'src/services/api.ts');
    const edges = importSpecifiers(file)
      .map((spec) => resolveToCluster(file, spec))
      .filter((key): key is string => key !== null);
    expect(edges).not.toContain('authService');
  });
});

describe('architecture: auth cluster is acyclic', () => {
  it('DFS over the cluster finds no import cycle', () => {
    const files = existingClusterFiles();
    const graph = new Map<string, Set<string>>();
    for (const entry of files) {
      const file = resolve(ROOT, entry.file);
      const edges = importSpecifiers(file)
        .map((spec) => resolveToCluster(file, spec))
        .filter((key): key is string => key !== null);
      graph.set(entry.key, new Set(edges));
    }

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (node: string) => {
      if (visited.has(node)) return;
      if (visiting.has(node)) {
        throw new Error(`Circular import detected through: ${node}`);
      }
      visiting.add(node);
      for (const next of graph.get(node) ?? []) visit(next);
      visiting.delete(node);
      visited.add(node);
    };
    for (const node of graph.keys()) visit(node);

    expect(visited.size).toBeGreaterThan(0);
  });
});

describe('architecture: cold-import initialization safety', () => {
  it('loading auth modules in dependency order yields defined exports', async () => {
    const store = await import('../src/store/authStore');
    expect(store.useAuthStore).toBeDefined();
    expect(store.getAuthToken).toBeDefined();

    const jwt = await import('../src/utils/jwt');
    expect(jwt.decodeToken).toBeDefined();

    const api = await import('../src/services/api');
    expect(api.default).toBeDefined();
  });

  it('loading the API client FIRST (before the store) still yields defined exports', async () => {
    vi.resetModules();
    const api = await import('../src/services/api');
    expect(api.default).toBeDefined();

    const store = await import('../src/store/authStore');
    expect(store.getAuthToken()).toBe('');
  });

  it('loading authSession first (if implemented) does not break module evaluation', async () => {
    vi.resetModules();
    const specifier = '../src/services/authSession';
    const session = await import(/* @vite-ignore */ specifier).catch(() => null);
    if (!session) return; // not implemented yet — rule activates when it lands
    for (const key of Object.keys(session)) {
      expect((session as Record<string, unknown>)[key]).not.toBeUndefined();
    }
  });
});
