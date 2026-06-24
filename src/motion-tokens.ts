export const motionTokens = {
  pageIn: {
    duration: 0.56,
    ease: "power3.out",
    source: "observed-original-style",
    reason: "页面切换要有轻微上浮和显现，接近原站的柔和入场节奏。",
  },
  cardHover: {
    duration: 0.28,
    ease: "power2.out",
    source: "observed-original-style",
    reason: "卡牌 hover 需要像纸牌被拿起，而不是普通按钮缩放。",
  },
  selectedCard: {
    duration: 0.72,
    ease: "elastic.out(1.1, 0.8)",
    source: "observed-original-style",
    reason: "正误反馈前的卡牌强调要有弹性，保留原站可爱的手感。",
  },
  letterPop: {
    duration: 0.52,
    ease: "back.out(1.6)",
    source: "observed-original-style",
    reason: "标题与反馈文字逐字弹出，强化花牌游戏的庆祝感。",
  },
} as const;
