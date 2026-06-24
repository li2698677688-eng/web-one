import type { KarutaCard, QuizAnswer } from "./types";

export const QUIZ_LENGTH = 5;

export function pickQuizCards(cards: KarutaCard[], seed = Date.now()): KarutaCard[] {
  const list = [...cards];
  let state = seed >>> 0;

  for (let index = list.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }

  return list.slice(0, QUIZ_LENGTH);
}

export function scoreAnswers(answers: QuizAnswer[]): number {
  return answers.filter((answer) => answer.correct).length;
}

export function nextLabel(index: number): string {
  if (index === 0) return "进入第 2 题";
  if (index === 1) return "进入第 3 题";
  if (index === 2) return "进入第 4 题";
  if (index === 3) return "进入最后一题";
  return "查看结果";
}

export function resultMessage(score: number): string {
  if (score === 5) return "非常漂亮的结果。\n你的牛仔知识已经是大师级了！";
  if (score === 4) return "很棒的结果。\n离牛仔大师只差一步！";
  if (score === 3) return "相当不错。\n45R 的牛仔果然很有深度。";
  if (score === 2) return "还不错。\n继续深入钻研牛仔之道吧！";
  if (score === 1) return "千里之行，始于足下。\n欢迎再来挑战！";
  return "失败是成功之母。\n请反复挑战看看！";
}

export function stripHtml(value: string): string {
  return value.replace(/<br\s*\/?>\n?/gi, "\n").replace(/<[^>]+>/g, "");
}
