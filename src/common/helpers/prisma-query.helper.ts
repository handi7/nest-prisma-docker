export type NestedInclude<T> = {
  [K in keyof T]?: T[K] extends object ? boolean | { include: NestedInclude<any> } : boolean;
};

export type NestedSelect<T> = {
  [K in keyof T]?: T[K] extends boolean
    ? boolean
    : T[K] extends object
      ? boolean | { select: NestedSelect<any> }
      : never;
};

type QueryMode = "include" | "select";

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepClone<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  if (isPlainObject(value)) {
    const cloned: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      cloned[key] = deepClone(value[key]);
    }
    return cloned as T;
  }

  return value;
}

function deepMerge(target: Record<string, any>, source: Record<string, any>) {
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (isPlainObject(targetValue) && isPlainObject(sourceValue)) {
      deepMerge(targetValue, sourceValue);
      continue;
    }

    target[key] = deepClone(sourceValue);
  }
}

/** Every requestable dot-path in an allow-list, descending through the `mode` container only. */
function getKeys(allowed: Record<string, any>, mode: QueryMode, prefix = ""): string[] {
  let result: string[] = [];

  for (const key of Object.keys(allowed)) {
    const value = allowed[key];
    if (value === undefined || value === false) continue;

    const path = prefix ? `${prefix}.${key}` : key;
    result.push(path);

    if (isPlainObject(value) && isPlainObject(value[mode])) {
      result = result.concat(getKeys(value[mode], mode, path));
    }
  }

  return result;
}

/** The dot-paths a client may pass in `?include=` / `?select=` for this allow-list. */
export function getAllowedPaths(allowed: object, mode: QueryMode): string[] {
  return getKeys(allowed as Record<string, any>, mode);
}

function keepDeepestPaths(paths: string[]): string[] {
  const sorted = [...paths].sort((a, b) => b.split(".").length - a.split(".").length);

  const result: string[] = [];

  for (const path of sorted) {
    const isParentOfExisting = result.some((existing) => existing.startsWith(path + "."));

    if (!isParentOfExisting) {
      result.push(path);
    }
  }

  return result;
}

/**
 * Builds the Prisma args for one requested path out of the allow-list entry it points at, so the
 * entry's own shape (a nested `select`, `omit`, `where`, ...) is what reaches Prisma — never a
 * bare `true` that would load every column of the relation.
 *
 * The `mode` container is the menu of what can be drilled into: only the requested child is
 * emitted from it. The exception is a `select` requested without drilling, which gets the whole
 * menu, because the menu is also the list of fields the relation is restricted to.
 */
function pickAllowed(
  allowed: Record<string, any>,
  keys: string[],
  mode: QueryMode,
): Record<string, any> | undefined {
  const [key, ...rest] = keys;
  const entry = allowed[key];

  if (entry === undefined || entry === false) return undefined;

  if (!isPlainObject(entry)) {
    return rest.length ? undefined : { [key]: true };
  }

  const { [mode]: children, ...options } = entry;
  const node: Record<string, any> = deepClone(options);

  if (rest.length) {
    if (!isPlainObject(children)) return undefined;

    const child = pickAllowed(children, rest, mode);
    if (!child) return undefined;

    node[mode] = child;
  } else if (mode === "select" && isPlainObject(children)) {
    node[mode] = deepClone(children);
  }

  return { [key]: Object.keys(node).length ? node : true };
}

function parseAllowed(
  input: string | undefined,
  allowed: Record<string, any> | undefined,
  mode: QueryMode,
): Record<string, any> | undefined {
  if (!input || !allowed) return undefined;

  const allowedKeys = new Set(getKeys(allowed, mode));
  const fields = input
    .split(",")
    .map((field) => field.trim())
    .filter((field) => allowedKeys.has(field));

  const result: Record<string, any> = {};

  for (const path of keepDeepestPaths(fields)) {
    const picked = pickAllowed(allowed, path.split("."), mode);
    if (picked) deepMerge(result, picked);
  }

  return Object.keys(result).length ? result : undefined;
}

/**
 * Turns `?include=a,b.c` into Prisma `include` args, limited to — and shaped by — `allowed`.
 * Without an allow-list nothing is included.
 */
export function parseInclude<T extends object>(
  include: string | undefined,
  allowed?: T,
): NestedInclude<T> | undefined {
  return parseAllowed(include, allowed as Record<string, any>, "include") as NestedInclude<T>;
}

/**
 * Turns `?select=a,b.c` into Prisma `select` args, limited to — and shaped by — `allowed`.
 */
export function parseSelect<T extends object>(
  select: string | undefined,
  allowed: T,
): NestedSelect<T> | undefined {
  return parseAllowed(select, allowed as Record<string, any>, "select") as NestedSelect<T>;
}

function setNestedValue(obj: Record<string, any>, path: string, value: any) {
  const keys = path.split(".");
  let current = obj;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] = current[key] || {};
      current = current[key];
    }
  });
}

function parseBooleanParam(value: unknown): boolean | undefined {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
}

export type BuildWhereOptions = {
  number?: string[];
  string?: string[];
  boolean?: string[];
};

export function buildWhere(query: Record<string, any>, options: BuildWhereOptions) {
  const where: Record<string, any> = {};

  if (options.number) {
    for (const field of options.number) {
      const value = Number(query[field]);
      if (!Number.isNaN(value) && value !== 0) {
        setNestedValue(where, field, value);
      }
    }
  }

  if (options.string) {
    for (const field of options.string) {
      const value = query[field];
      if (typeof value === "string" && value.trim() !== "") {
        setNestedValue(where, field, value);
      }
    }
  }

  if (options.boolean) {
    for (const field of options.boolean) {
      // Only an explicit true/false filters; an absent param must not become `false`.
      const value = parseBooleanParam(query[field]);
      if (value !== undefined) {
        setNestedValue(where, field, value);
      }
    }
  }

  return where;
}
