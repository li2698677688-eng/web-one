import { describe, expect, it } from "vitest";
import { karutaCards } from "../data/karutas";
import { nextLabel, pickQuizCards, resultMessage, scoreAnswers } from "../quiz";

describe("quiz helpers", () => {
  it("picks five unique cards", () => {
    const picked = pickQuizCards(karutaCards, 45);
    expect(picked).toHaveLength(5);
    expect(new Set(picked.map((card) => card.id)).size).toBe(5);
  });

  it("scores correct answers", () => {
    const [one, two] = karutaCards;
    expect(
      scoreAnswers([
        { question: one, selected: one, correct: true },
        { question: two, selected: one, correct: false },
      ]),
    ).toBe(1);
  });

  it("matches the navigation labels and score copy", () => {
    expect(nextLabel(0)).toBe("进入第 2 题");
    expect(nextLabel(4)).toBe("查看结果");
    expect(resultMessage(0)).toContain("失败是成功之母");
    expect(resultMessage(5)).toContain("大师级");
  });
});
