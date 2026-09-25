import { buildWhere, parseInclude, parseSelect } from "./prisma-query.helper";

describe("parseInclude", () => {
  const allowed = {
    role: {
      include: {
        permissions: { include: { permission: true } },
        users: { select: { id: true, name: true } },
      },
    },
    creator: { select: { id: true, name: true } },
    files: true,
  };

  it("returns undefined without input or allow-list", () => {
    expect(parseInclude(undefined, allowed)).toBeUndefined();
    expect(parseInclude("role")).toBeUndefined();
  });

  it("drops paths that are not in the allow-list", () => {
    expect(parseInclude("password,secrets.deep", allowed)).toBeUndefined();
    expect(parseInclude("files,unknown", allowed)).toEqual({ files: true });
  });

  it("keeps the allow-list entry's shape instead of widening it to `true`", () => {
    expect(parseInclude("creator", allowed)).toEqual({
      creator: { select: { id: true, name: true } },
    });
  });

  it("includes only the requested nested relations", () => {
    expect(parseInclude("role", allowed)).toEqual({ role: true });
    expect(parseInclude("role.permissions.permission", allowed)).toEqual({
      role: { include: { permissions: { include: { permission: true } } } },
    });
  });

  it("merges sibling paths and keeps nested restrictions", () => {
    expect(parseInclude("role.permissions, role.users,files", allowed)).toEqual({
      role: {
        include: {
          permissions: true,
          users: { select: { id: true, name: true } },
        },
      },
      files: true,
    });
  });

  it("does not leak mutations back into the allow-list", () => {
    const result = parseInclude("creator", allowed) as any;
    result.creator.select.password = true;

    expect(allowed.creator.select).toEqual({ id: true, name: true });
  });
});

describe("parseSelect", () => {
  const allowed = {
    id: true,
    name: true,
    role: { select: { id: true, name: true } },
  };

  it("selects allowed scalars only", () => {
    expect(parseSelect("id,password", allowed)).toEqual({ id: true });
  });

  it("restricts a bare relation to its allowed fields", () => {
    expect(parseSelect("role", allowed)).toEqual({ role: { select: { id: true, name: true } } });
  });

  it("drills into a relation's fields", () => {
    expect(parseSelect("name,role.name", allowed)).toEqual({
      name: true,
      role: { select: { name: true } },
    });
  });
});

describe("buildWhere", () => {
  it("ignores absent boolean params", () => {
    expect(buildWhere({}, { boolean: ["is_active"] })).toEqual({});
    expect(buildWhere({ is_active: "maybe" }, { boolean: ["is_active"] })).toEqual({});
  });

  it("filters on explicit true/false", () => {
    expect(buildWhere({ is_active: "true" }, { boolean: ["is_active"] })).toEqual({
      is_active: true,
    });
    expect(buildWhere({ is_active: "false" }, { boolean: ["is_active"] })).toEqual({
      is_active: false,
    });
  });
});
