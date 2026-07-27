import { describe, expect, it } from "vitest";

import { Field } from "@/services/client/meta.types";
import { moment } from "@/services/client/l10n";
import { getSearchFilter } from "./utils";

describe("getSearchFilter date parsing", () => {
  // explicit dateFormat so results don't depend on the test runner's locale
  const dateField = {
    name: "orderDate",
    type: "DATE",
    dateFormat: "DD/MM/YYYY",
  } as unknown as Field;
  const fields = { orderDate: dateField };

  it("filters by single-digit month and year (M/YYYY)", () => {
    const filter = getSearchFilter(fields, [], { orderDate: "6/2026" });
    expect(filter?.criteria?.[0]).toEqual({
      operator: "and",
      criteria: [
        { fieldName: "orderDate", operator: ">=", value: "2026-06-01" },
        { fieldName: "orderDate", operator: "<", value: "2026-07-01" },
      ],
    });
  });

  it("filters by single-digit year and month (YYYY/M)", () => {
    const filter = getSearchFilter(fields, [], { orderDate: "2026/6" });
    expect(filter?.criteria?.[0]).toEqual({
      operator: "and",
      criteria: [
        { fieldName: "orderDate", operator: ">=", value: "2026-06-01" },
        { fieldName: "orderDate", operator: "<", value: "2026-07-01" },
      ],
    });
  });

  it("filters by single-digit day and month (D/M, default DD/MM order)", () => {
    const currentYear = moment().year();
    const filter = getSearchFilter(fields, [], { orderDate: "6/5" });
    // default locale order is DD/MM, so "6/5" means day=6, month=5
    expect(filter?.criteria?.[0]).toEqual({
      operator: "and",
      criteria: [
        {
          fieldName: "orderDate",
          operator: ">=",
          value: `${currentYear}-05-06`,
        },
        {
          fieldName: "orderDate",
          operator: "<",
          value: `${currentYear}-05-07`,
        },
      ],
    });
  });

  it("filters by full single-digit date (D/M/YYYY, default DD/MM/YYYY order)", () => {
    const filter = getSearchFilter(fields, [], { orderDate: "6/5/2026" });
    expect(filter?.criteria?.[0]).toEqual({
      operator: "and",
      criteria: [
        { fieldName: "orderDate", operator: ">=", value: "2026-05-06" },
        { fieldName: "orderDate", operator: "<", value: "2026-05-07" },
      ],
    });
  });

  it("still filters by zero-padded month and year (MM/YYYY)", () => {
    const filter = getSearchFilter(fields, [], { orderDate: "06/2026" });
    expect(filter?.criteria?.[0]).toEqual({
      operator: "and",
      criteria: [
        { fieldName: "orderDate", operator: ">=", value: "2026-06-01" },
        { fieldName: "orderDate", operator: "<", value: "2026-07-01" },
      ],
    });
  });

  it("still filters by zero-padded full date (DD/MM/YYYY)", () => {
    const filter = getSearchFilter(fields, [], { orderDate: "06/05/2026" });
    expect(filter?.criteria?.[0]).toEqual({
      operator: "and",
      criteria: [
        { fieldName: "orderDate", operator: ">=", value: "2026-05-06" },
        { fieldName: "orderDate", operator: "<", value: "2026-05-07" },
      ],
    });
  });

  it("drops the criterion for an unparseable date instead of matching Invalid Date", () => {
    const filter = getSearchFilter(fields, [], { orderDate: "not-a-date" });
    expect(filter?.criteria).toEqual([]);
  });

  it("keeps criteria for other columns when one date value is unparseable", () => {
    const nameField = { name: "name", type: "STRING" } as unknown as Field;
    const filter = getSearchFilter({ ...fields, name: nameField }, [], {
      orderDate: "not-a-date",
      name: "acme",
    });
    expect(filter?.criteria).toEqual([
      { fieldName: "name", value: "acme", operator: "like" },
    ]);
  });

  it("drops the criterion for a long digit string instead of truncating it to a year", () => {
    // dayjs's YYYY token silently truncates to its first 4 digits and
    // reports the result as valid, so this must be rejected explicitly.
    const filter = getSearchFilter(fields, [], { orderDate: "4239374231" });
    expect(filter?.criteria).toEqual([]);
  });

  it("drops the criterion for an out-of-range day/month instead of rolling over", () => {
    // dayjs loosely rolls "32/13/2026" over into a later date instead of
    // rejecting it; the round-trip check catches the mismatch.
    const filter = getSearchFilter(fields, [], { orderDate: "32/13/2026" });
    expect(filter?.criteria).toEqual([]);
  });

  it("drops the criterion for digits followed by garbage text", () => {
    // dayjs extracts "2026" from the string and ignores the trailing
    // letters entirely, reporting the result as a valid year.
    const filter = getSearchFilter(fields, [], {
      orderDate: "2026kfjhkdshfksdhfk",
    });
    expect(filter?.criteria).toEqual([]);
  });
});

describe("getSearchFilter number parsing", () => {
  const amountField = {
    name: "amount",
    type: "DECIMAL",
  } as unknown as Field;
  const fields = { amount: amountField };

  it("filters by a valid number", () => {
    const filter = getSearchFilter(fields, [], { amount: "12.5" });
    expect(filter?.criteria?.[0]).toEqual({
      fieldName: "amount",
      value: 12.5,
      operator: "=",
    });
  });

  it("drops the criterion for non-numeric text instead of matching 0", () => {
    const filter = getSearchFilter(fields, [], { amount: "abc" });
    expect(filter?.criteria).toEqual([]);
  });
});
