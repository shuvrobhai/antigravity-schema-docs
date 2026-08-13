/**
 * errors.ts — the single home for error-to-message coercion.
 *
 * Shared by the web app and the CLI scripts. `catch` variables are `unknown`
 * under strict mode; this is the one sanctioned way to render one as text.
 */
export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
