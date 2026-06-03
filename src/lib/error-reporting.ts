type ErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

/**
 * Reports an error to the console (and any future error tracking service).
 * Replace the console.error body with your preferred service (Sentry, etc.)
 */
export function reportError(
  error: unknown,
  context: Record<string, unknown> = {},
  options: ErrorOptions = {},
) {
  if (typeof window === "undefined") return;

  console.error("[YouthLink Error]", {
    error,
    context: {
      route: window.location.pathname,
      ...context,
    },
    severity: options.severity ?? "error",
    mechanism: options.mechanism ?? "manual",
    handled: options.handled ?? false,
  });
}
