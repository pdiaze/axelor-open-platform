import { describe, expect, it } from "vitest";

import { getPhoneInfo, normalizePastedPhoneValue } from "./utils";

describe("getPhoneInfo", () => {
  it("parses national numbers with a country hint", async () => {
    const phoneNumber = await getPhoneInfo("9876543210", "in");

    expect(phoneNumber.isPossible()).toBe(true);
  });
});

describe("normalizePastedPhoneValue", () => {
  it("normalizes a French national number with trunk prefix", async () => {
    await expect(
      normalizePastedPhoneValue("0608691275", "fr"),
    ).resolves.toEqual({
      phone: "+33608691275",
      countryIso2: "fr",
    });
  });

  it("ignores incomplete pasted numbers", async () => {
    await expect(normalizePastedPhoneValue("0608", "fr")).resolves.toBeNull();
  });
});
