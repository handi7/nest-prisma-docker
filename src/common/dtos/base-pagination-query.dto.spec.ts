import { ZodQueryPipe } from "../pipes/zod-query.pipe";

import { BasePaginationQuerySchema } from "./base-pagination-query.dto";

describe("BasePaginationQuerySchema", () => {
  const pipe = new ZodQueryPipe(BasePaginationQuerySchema);

  it("parses an empty query into defaults", () => {
    expect(pipe.transform({})).toEqual({ page: 1, limit: 10, search: "", desc: false });
  });

  it("coerces query-string values", () => {
    expect(pipe.transform({ page: "3", limit: "25", sortBy: "name", desc: "true" })).toEqual({
      page: 3,
      limit: 25,
      search: "",
      sortBy: "name",
      desc: true,
    });
  });

  it('treats desc="false" as false', () => {
    expect(pipe.transform({ desc: "false" })).toMatchObject({ desc: false });
    expect(pipe.transform({ desc: "0" })).toMatchObject({ desc: false });
  });

  it("falls back to defaults for invalid values instead of passing raw strings through", () => {
    expect(pipe.transform({ page: "abc", limit: "-5", desc: "yes" })).toEqual({
      page: 1,
      limit: 10,
      search: "",
      desc: false,
    });
  });
});
