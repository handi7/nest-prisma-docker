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

function parseNestedQuery<T = any>(
  input: string | undefined,
  mode: "include",
): NestedInclude<T> | undefined;

function parseNestedQuery<T = any>(
  input: string | undefined,
  mode: "select",
): NestedSelect<T> | undefined;

function parseNestedQuery<T = any>(
  input?: string,
  mode: "include" | "select" = "include",
): NestedInclude<T> | NestedSelect<T> | undefined {
  if (!input) return undefined;

  const fields = input.split(",");
  const result: NestedInclude<T> | NestedSelect<T> = {};

  for (const field of fields) {
    const parts = field.split(".");
    let current: any = result;

    for (let i = 0; i < parts.length; i++) {
      const key = parts[i];

      if (i === parts.length - 1) {
        current[key] = true;
      } else {
        current[key] = current[key] || { [mode]: {} };
        current = current[key][mode];
      }
    }
  }

  return result;
}

function getKeys<T extends object>(obj: T, prefix = ""): string[] {
  let result: string[] = [];

  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key;
    result.push(path);

    const value: any = obj[key];

    if (value?.include) {
      result = result.concat(getKeys(value.include, path));
    }
  }

  return result;
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

export function parseInclude<T extends object>(
  include: string | undefined,
  allowed?: T,
): NestedInclude<T> | undefined {
  if (!include) return undefined;

  const allowedKeys = allowed ? getKeys(allowed) : [];
  const fields = include.split(",");

  const filtered = fields.filter((field) => allowedKeys.includes(field));

  if (!filtered.length) {
    return undefined;
  }

  const deepest = keepDeepestPaths(filtered);

  return parseNestedQuery(deepest.join(","), "include");
}

export function parseSelect<T extends object>(
  select: string | undefined,
  allowed: T,
): NestedSelect<T> | undefined {
  if (!select) return undefined;

  const allowedKeys = allowed ? getKeys(allowed) : [];
  const fields = select.split(",");

  const filtered = fields.filter((field) => allowedKeys.includes(field));

  if (!filtered.length) {
    return undefined;
  }

  const deepest = keepDeepestPaths(filtered);

  return parseNestedQuery(deepest.join(","), "select");
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
      const value = query[field] === "true";
      if (typeof value === "boolean") {
        setNestedValue(where, field, value);
      }
    }
  }

  return where;
}
