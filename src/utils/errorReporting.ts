import logger from './logger';

/**
 * Single reporting sink for unexpected application errors.
 *
 * Every error path (error boundaries, unhandled rejections, ad-hoc catches)
 * must go through `reportError()` so the destination can be swapped in one
 * place when error tracking lands (FE-021). Until then the destination is
 * the production-safe logger.
 */
export interface ErrorContext {
  /** Stack of the React component tree, provided by error boundaries. */
  componentStack?: string;
  /** Structured extras (source of the report, request info, …). */
  extra?: Record<string, unknown>;
}

export function reportError(error: unknown, context: ErrorContext = {}): void {
  const normalized =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { name: 'NonError', message: String(error), stack: undefined };

  logger.error(normalized.message, {
    name: normalized.name,
    stack: normalized.stack,
    componentStack: context.componentStack,
    ...(context.extra ?? {}),
  });
}

export default reportError;
