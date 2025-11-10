export function colorResponseCode(code: number) {
  if (code >= 200 && code < 300) return `\x1b[32m${code}\x1b[32m`;
  if (code >= 300 && code < 400) return `\x1b[33m${code}\x1b[32m`;
  return `\x1b[31m${code}\x1b[32m`;
}

export function colorResponseTime(ms: number) {
  if (ms < 200) return `\x1b[32m${ms}ms\x1b[32m`;
  if (ms < 1000) return `\x1b[33m${ms}ms\x1b[32m`;
  return `\x1b[31m${ms}ms\x1b[32m`;
}
