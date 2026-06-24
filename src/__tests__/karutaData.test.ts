import { describe, expect, it } from "vitest";
import { karutaCards } from "../data/karutas";
import { karutaTextZh } from "../data/karutas-zh";

describe("karuta data", () => {
  it("contains the complete 45 card set", () => {
    expect(karutaCards).toHaveLength(45);
    expect(new Set(karutaCards.map((card) => card.id)).size).toBe(45);
  });

  it("keeps both illustrated and product sides", () => {
    const first = karutaCards[0];
    expect(first.omote).toContain("card_omote");
    expect(first.ura).toContain("/_wp/wp-content/uploads/");
    expect(first.yomi.length).toBeGreaterThan(4);
  });

  it("has Chinese display text for every card", () => {
    expect(Object.keys(karutaTextZh)).toHaveLength(45);
    expect(karutaTextZh[0].yomi).toContain("牛仔");
    expect(karutaTextZh[44].name).toBe("牛仔大师");
  });
});
