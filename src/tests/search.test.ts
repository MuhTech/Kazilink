import { describe, it, expect } from "vitest";
import { postgresSearchAdapter, TANZANIA_REGIONS } from "@/lib/search/search-service";

describe("Search & Discovery Engine Suite", () => {
  it("should contain all major Tanzanian administrative regions", () => {
    expect(TANZANIA_REGIONS).toContain("Dar es Salaam");
    expect(TANZANIA_REGIONS).toContain("Mwanza");
    expect(TANZANIA_REGIONS).toContain("Arusha");
    expect(TANZANIA_REGIONS).toContain("Dodoma");
    expect(TANZANIA_REGIONS).toContain("Zanzibar");
    expect(TANZANIA_REGIONS.length).toBeGreaterThanOrEqual(20);
  });

  it("should provide bilingual search autocomplete suggestions", async () => {
    const swSuggestions = await postgresSearchAdapter.getSuggestions("mhandisi", "sw");
    expect(swSuggestions.length).toBeGreaterThan(0);
    expect(swSuggestions[0]).toContain("Mhandisi wa Programu");

    const enSuggestions = await postgresSearchAdapter.getSuggestions("software", "en");
    expect(enSuggestions.length).toBeGreaterThan(0);
    expect(enSuggestions[0]).toContain("Software Engineer");
  });
});
