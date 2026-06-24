import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { siteAssets } from "./data/assets";
import { karutaCards } from "./data/karutas";
import { getKarutaText } from "./data/karutas-zh";
import { motionTokens } from "./motion-tokens";
import { nextLabel, pickQuizCards, resultMessage, scoreAnswers, stripHtml } from "./quiz";
import { soundDeck } from "./sound";
import type { KarutaCard, QuizAnswer, SoundMode, Stage } from "./types";
import "./styles.css";

const totalQuestions = 5;

export function App() {
  const [stage, setStage] = useState<Stage>("loading");
  const [quizCards, setQuizCards] = useState<KarutaCard[]>(() =>
    pickQuizCards(karutaCards, 45),
  );
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedCard, setSelectedCard] = useState<KarutaCard | null>(null);
  const [soundMode, setSoundMode] = useState<SoundMode>("off");
  const [detailIndex, setDetailIndex] = useState(0);
  const [bookIndex, setBookIndex] = useState(0);

  const currentCard = quizCards[quizIndex] ?? quizCards[0];
  const score = scoreAnswers(answers);

  useEffect(() => {
    const timer = window.setTimeout(() => setStage("intro"), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const pageShell = gsap.utils.toArray<HTMLElement>(".page-shell");
      const letters = gsap.utils.toArray<HTMLElement>(".letter-pop");

      if (pageShell.length > 0) {
        gsap.fromTo(
          pageShell,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: motionTokens.pageIn.duration,
            ease: motionTokens.pageIn.ease,
          },
        );
      }

      if (letters.length > 0) {
        gsap.fromTo(
          letters,
          { yPercent: 110, rotate: 4, opacity: 0 },
          {
            yPercent: 0,
            rotate: 0,
            opacity: 1,
            duration: motionTokens.letterPop.duration,
            ease: motionTokens.letterPop.ease,
            stagger: 0.035,
            delay: 0.12,
          },
        );
      }
    });
    return () => ctx.revert();
  }, [stage, quizIndex, detailIndex, bookIndex]);

  useEffect(() => () => soundDeck.dispose(), []);

  function enableSound() {
    soundDeck.unlock();
    setSoundMode("on");
  }

  function muteSound() {
    soundDeck.mute();
    setSoundMode("off");
  }

  function startGame() {
    setQuizCards(pickQuizCards(karutaCards));
    setQuizIndex(0);
    setAnswers([]);
    setSelectedCard(null);
    setDetailIndex(0);
    soundDeck.play("click");
    setStage("tutorial");
  }

  function selectAnswer(card: KarutaCard) {
    const correct = card.id === currentCard.id;
    const answer: QuizAnswer = { question: currentCard, selected: card, correct };
    setSelectedCard(card);
    setAnswers((previous) => [...previous, answer]);
    soundDeck.play(correct ? "correct" : "incorrect");
    setStage(correct ? "quizCorrect" : "quizIncorrect");
  }

  function goNext() {
    soundDeck.play("click");
    if (quizIndex >= totalQuestions - 1) {
      setStage("resultScore");
      return;
    }
    setQuizIndex((index) => index + 1);
    setSelectedCard(null);
    setStage("quizQuestion");
  }

  function resetToIntro() {
    soundDeck.play("reset");
    setQuizIndex(0);
    setAnswers([]);
    setSelectedCard(null);
    setDetailIndex(0);
    setStage("intro");
  }

  return (
    <main className={`app stage-${stage}`}>
      <TextureLayer stage={stage} />
      <TopChrome stage={stage} soundMode={soundMode} onSoundOn={enableSound} onSoundOff={muteSound} />

      {stage === "loading" && <LoadingPage />}
      {stage === "intro" && (
        <IntroPage soundMode={soundMode} onSoundOn={enableSound} onSoundOff={muteSound} onStart={startGame} />
      )}
      {stage === "tutorial" && (
        <TutorialPage
          onStart={() => {
            soundDeck.play("enter");
            setStage("quizQuestion");
          }}
        />
      )}
      {stage === "quizQuestion" && (
        <QuestionPage
          card={currentCard}
          index={quizIndex}
          onAnswer={() => {
            soundDeck.play("enter");
            setStage("quizAnswer");
          }}
        />
      )}
      {stage === "quizAnswer" && (
        <AnswerPage card={currentCard} index={quizIndex} onSelect={selectAnswer} />
      )}
      {stage === "quizCorrect" && (
        <FeedbackPage
          correct
          card={currentCard}
          selected={selectedCard}
          index={quizIndex}
          onNext={goNext}
        />
      )}
      {stage === "quizIncorrect" && (
        <FeedbackPage
          correct={false}
          card={currentCard}
          selected={selectedCard}
          index={quizIndex}
          onNext={goNext}
        />
      )}
      {stage === "resultScore" && (
        <ResultScorePage
          score={score}
          onDetails={() => {
            soundDeck.play("enter");
            setStage("resultDetails");
          }}
        />
      )}
      {stage === "resultDetails" && (
        <ResultDetailsPage
          answers={answers}
          index={detailIndex}
          onIndex={setDetailIndex}
          onRetry={resetToIntro}
          onBook={() => {
            soundDeck.play("enter");
            setStage("book");
          }}
        />
      )}
      {stage === "book" && (
        <BookPage
          index={bookIndex}
          onIndex={setBookIndex}
          onBack={() => {
            soundDeck.play("click");
            setStage("resultDetails");
          }}
        />
      )}

      <footer className="site-footer">©45rpm studio co., ltd.</footer>
    </main>
  );
}

function TextureLayer({ stage }: { stage: Stage }) {
  const beige = stage === "intro" || stage === "loading";
  return (
    <div
      className={`texture-layer ${beige ? "is-beige" : "is-navy"}`}
      style={{
        backgroundImage: `url(${beige ? siteAssets.bgBeige : siteAssets.bgNavy})`,
      }}
    />
  );
}

function TopChrome({
  stage,
  soundMode,
  onSoundOn,
  onSoundOff,
}: {
  stage: Stage;
  soundMode: SoundMode;
  onSoundOn: () => void;
  onSoundOff: () => void;
}) {
  if (stage === "loading" || stage === "intro") return null;

  return (
    <header className="top-chrome">
      <div className="brand-mark">45R</div>
      <div className="sound-pill" aria-label="声音">
        <button className={soundMode === "on" ? "is-active" : ""} onClick={onSoundOn} type="button">
          开
        </button>
        <button className={soundMode === "off" ? "is-active" : ""} onClick={onSoundOff} type="button">
          关
        </button>
      </div>
    </header>
  );
}

function LoadingPage() {
  return (
    <section className="page-shell loading-page" aria-label="加载中">
      <div className="loading-stack">
        <span className="loading-zero">0</span>
        <span className="loading-bar" />
        <span className="loading-max">45</span>
      </div>
    </section>
  );
}

function IntroPage({
  soundMode,
  onSoundOn,
  onSoundOff,
  onStart,
}: {
  soundMode: SoundMode;
  onSoundOn: () => void;
  onSoundOff: () => void;
  onStart: () => void;
}) {
  return (
    <section className="page-shell intro-page">
      <div className="intro-logo">45R</div>
      <FloatingIntroCards />
      <h1 className="intro-title" aria-label="牛仔花牌">
        {"牛仔花牌".split("").map((letter, index) => (
          <span className="letter-pop" key={`${letter}-${index}`}>
            {letter}
          </span>
        ))}
      </h1>
      <p className="intro-copy">
        45R 牛仔的各种故事，变成了 45 张花牌。
        <br />
        一边找牌，一边了解牛仔背后的讲究。
      </p>
      <div className="sound-choice">
        <p>这个网站会播放声音</p>
        <div>
          <button className={soundMode === "on" ? "is-active" : ""} type="button" onClick={onSoundOn}>
            开启声音
          </button>
          <button className={soundMode === "off" ? "is-active" : ""} type="button" onClick={onSoundOff}>
            关闭声音
          </button>
        </div>
      </div>
      <button className="primary-button" type="button" onClick={onStart}>
        开始
      </button>
    </section>
  );
}

function FloatingIntroCards() {
  return (
    <div className="intro-cards" aria-hidden="true">
      {siteAssets.introCards.map((src, index) => (
        <img className={`intro-card intro-card-${index + 1}`} src={src} alt="" key={src} />
      ))}
    </div>
  );
}

function TutorialPage({ onStart }: { onStart: () => void }) {
  return (
    <section className="page-shell tutorial-page">
      <div className="question-badge">练习题</div>
      <div className="speech-balloon">
        <span>这是练习题！</span>
        <span>请仔细阅读这段文字。</span>
        <span>下一屏里，请选出画着 45R 牛仔知识的那张图牌。</span>
      </div>
      <div className="tutorial-card-cluster" aria-hidden="true">
        {siteAssets.introCards.map((src, index) => (
          <img src={src} alt="" key={src} style={{ "--tilt": `${(index - 1) * 16}deg` } as React.CSSProperties} />
        ))}
      </div>
      <button className="circle-action" type="button" onClick={onStart} aria-label="开始答题！">
        <span>开始答题！</span>
        <ArrowIcon />
      </button>
    </section>
  );
}

function QuestionPage({
  card,
  index,
  onAnswer,
}: {
  card: KarutaCard;
  index: number;
  onAnswer: () => void;
}) {
  const text = getKarutaText(card);

  return (
    <section className="page-shell question-page">
      <QuestionBadge index={index} />
      <h2 className="question-yomi" aria-label={stripHtml(text.yomiSp || text.yomi)}>
        {splitLines(stripHtml(text.yomiSp || text.yomi)).map((line, lineIndex) => (
          <span key={`${line}-${lineIndex}`}>
            {line.split("").map((letter, index) => (
              <span className="letter-pop" key={`${letter}-${index}`}>
                {letter}
              </span>
            ))}
          </span>
        ))}
      </h2>
      <FloatingIntroCards />
      <button className="circle-action question-action" type="button" onClick={onAnswer} aria-label="对应的图牌是哪一张？">
        <span>对应的图牌是哪一张？</span>
        <ArrowIcon />
      </button>
    </section>
  );
}

function AnswerPage({
  card,
  index,
  onSelect,
}: {
  card: KarutaCard;
  index: number;
  onSelect: (card: KarutaCard) => void;
}) {
  const text = getKarutaText(card);

  return (
    <section className="page-shell answer-page">
      <div className="answer-question">
        <QuestionBadge index={index} compact />
        <p>{stripHtml(text.yomiSp || text.yomi)}</p>
      </div>
      <CardField onSelect={onSelect} />
      <p className="drag-note">拖动来寻找卡牌</p>
    </section>
  );
}

function CardField({ onSelect }: { onSelect: (card: KarutaCard) => void }) {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ id: number; startX: number; startY: number; panX: number; panY: number } | null>(null);
  const positions = useMemo(() => makeCardPositions(karutaCards.length), []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.isPrimary) return;
    if ((event.target as HTMLElement).closest(".answer-card")) return;
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const active = drag.current;
    if (!active || active.id !== event.pointerId) return;
    setPan({
      x: clamp(active.panX + event.clientX - active.startX, -280, 280),
      y: clamp(active.panY + event.clientY - active.startY, -220, 220),
    });
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.id === event.pointerId) {
      drag.current = null;
    }
  }

  return (
    <div
      className="card-field-wrap"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      style={{ "--pan-x": `${pan.x}px`, "--pan-y": `${pan.y}px` } as React.CSSProperties}
    >
      <div className="card-field">
        {karutaCards.map((item, index) => {
          const pos = positions[index];
          return (
            <button
              className="answer-card"
              key={item.id}
              onClick={(event) => {
                event.stopPropagation();
                soundDeck.play("card");
                onSelect(item);
              }}
              style={
                {
                  "--x": `${pos.x}%`,
                  "--y": `${pos.y}%`,
                  "--rotate": `${pos.rotate}deg`,
                  "--z": pos.z,
                } as React.CSSProperties
              }
              type="button"
            >
              <span className="card-thickness">
                <img
                  src={item.omote}
                  alt={getKarutaText(item).name}
                  loading="eager"
                  fetchPriority="high"
                  draggable={false}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FeedbackPage({
  correct,
  card,
  selected,
  index,
  onNext,
}: {
  correct: boolean;
  card: KarutaCard;
  selected: KarutaCard | null;
  index: number;
  onNext: () => void;
}) {
  const cardText = getKarutaText(card);
  const selectedText = selected ? getKarutaText(selected) : null;

  return (
    <section className={`page-shell feedback-page ${correct ? "is-correct" : "is-incorrect"}`}>
      <QuestionBadge index={index} />
      <h2 className="feedback-title" aria-label={correct ? "答对了！" : "答错了"}>
        {(correct ? "答对了！" : "答错了").split("").map((letter, i) => (
          <span className="letter-pop" key={`${letter}-${i}`}>
            {letter}
          </span>
        ))}
      </h2>
      <div className="feedback-cards">
        {!correct && selected && (
          <div className="feedback-card is-selected">
            <small>你选的牌</small>
            <img src={selected.omote} alt={selectedText?.name} />
          </div>
        )}
        <div className="feedback-card is-answer">
          <small>{correct ? "正确的牌" : "正确答案是这张"}</small>
          <img src={card.omote} alt={cardText.name} />
        </div>
      </div>
      <p className="feedback-copy">
        {correct ? "保持这个节奏，向全对前进！" : `正确答案是「${cardText.name}」。继续下一题吧。`}
      </p>
      <button className="next-link" type="button" onClick={onNext}>
        <span>{nextLabel(index)}</span>
        <ArrowIcon />
      </button>
    </section>
  );
}

function ResultScorePage({ score, onDetails }: { score: number; onDetails: () => void }) {
  return (
    <section className="page-shell result-score-page">
      <h2 className="score-title">
        <span>5 题中</span>
        <strong>{score > 0 ? `答对 ${score} 题！` : "全部答错……"}</strong>
      </h2>
      {score > 2 && (
        <div className="score-stars">
          {siteAssets.stars.slice(0, score).map((src, index) => (
            <img src={src} alt="" key={`${src}-${index}`} />
          ))}
        </div>
      )}
      <p className="score-message">
        {splitLines(resultMessage(score)).map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
      <button className="next-link score-link" type="button" onClick={onDetails}>
        <span>查看答案</span>
        <ArrowIcon />
      </button>
    </section>
  );
}

function ResultDetailsPage({
  answers,
  index,
  onIndex,
  onRetry,
  onBook,
}: {
  answers: QuizAnswer[];
  index: number;
  onIndex: (index: number) => void;
  onRetry: () => void;
  onBook: () => void;
}) {
  const answer = answers[index] ?? answers[0];

  if (!answer) {
    return (
      <section className="page-shell result-details-page">
        <button className="primary-button" type="button" onClick={onRetry}>
          返回标题页
        </button>
      </section>
    );
  }

  return (
    <section className="page-shell result-details-page">
      <div className="details-quiz-card">
        <div className="details-question">
          <QuestionBadge index={index} compact />
          <p>{stripHtml(getKarutaText(answer.question).yomiSp || getKarutaText(answer.question).yomi)}</p>
          <div className={`answer-mark ${answer.correct ? "is-correct" : "is-incorrect"}`}>
            <span>{answer.correct ? "答对" : "答错"}</span>
          </div>
        </div>
        <div className="details-card-showcase">
          <img src={answer.question.omote} alt={getKarutaText(answer.question).name} />
          <div>
            <h2>{getKarutaText(answer.question).name}</h2>
            <p className="card-year">{answer.question.year}</p>
            <p dangerouslySetInnerHTML={{ __html: getKarutaText(answer.question).description }} />
            {answer.question.link && (
              <a href={answer.question.link} target="_blank" rel="noreferrer">
                查看与这张牌相关的页面
              </a>
            )}
          </div>
        </div>
      </div>
      <CarouselControls
        current={index}
        total={answers.length}
        onPrev={() => onIndex(Math.max(0, index - 1))}
        onNext={() => onIndex(Math.min(answers.length - 1, index + 1))}
      />
      <div className="details-actions">
        <button className="round-menu is-light" type="button" onClick={onRetry}>
          再来
          <br />
          挑战一次
        </button>
        <button className="round-menu" type="button" onClick={onBook}>
          查看所有卡牌
        </button>
      </div>
    </section>
  );
}

function BookPage({
  index,
  onIndex,
  onBack,
}: {
  index: number;
  onIndex: (index: number) => void;
  onBack: () => void;
}) {
  const card = karutaCards[index];
  const text = getKarutaText(card);

  return (
    <section className="page-shell book-page">
      <h2 className="book-title" aria-label="45R牛仔图鉴">
        {"45R牛仔图鉴".split("").map((letter, i) => (
          <span className="letter-pop" key={`${letter}-${i}`}>
            {letter}
          </span>
        ))}
      </h2>
      <div className="book-stage">
        <button className="book-nav prev" type="button" onClick={() => onIndex(Math.max(0, index - 1))}>
          <ArrowIcon left />
        </button>
        <article className="book-card">
          <img src={card.omote} alt={text.name} />
          <div>
            <p className="book-count">
              {String(index + 1).padStart(2, "0")} / {karutaCards.length}
            </p>
            <h3>{text.name}</h3>
            <p className="card-year">{card.year}</p>
            <p dangerouslySetInnerHTML={{ __html: text.description }} />
            {card.link && (
              <a href={card.link} target="_blank" rel="noreferrer">
                查看与这张牌相关的页面
              </a>
            )}
          </div>
        </article>
        <button className="book-nav next" type="button" onClick={() => onIndex(Math.min(karutaCards.length - 1, index + 1))}>
          <ArrowIcon />
        </button>
      </div>
      <div className="book-strip" aria-label="all cards">
        {karutaCards.map((item, itemIndex) => (
          <button
            className={itemIndex === index ? "is-active" : ""}
            key={item.id}
            type="button"
            onClick={() => onIndex(itemIndex)}
          >
            <img src={item.omote} alt={getKarutaText(item).name} loading="lazy" />
          </button>
        ))}
      </div>
      <button className="book-close" type="button" onClick={onBack}>
        关闭图鉴
      </button>
    </section>
  );
}

function QuestionBadge({ index, compact = false }: { index: number; compact?: boolean }) {
  return (
    <div className={`question-badge ${compact ? "is-compact" : ""}`}>
      <span>第{index + 1}题</span>
      <small>/ 5</small>
    </div>
  );
}

function CarouselControls({
  current,
  total,
  onPrev,
  onNext,
}: {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="carousel-controls">
      <button disabled={current === 0} type="button" onClick={onPrev} aria-label="上一张">
        <ArrowIcon left />
      </button>
      <span>
        {current + 1} / {total}
      </span>
      <button disabled={current === total - 1} type="button" onClick={onNext} aria-label="下一张">
        <ArrowIcon />
      </button>
    </div>
  );
}

function ArrowIcon({ left = false }: { left?: boolean }) {
  return (
    <svg className={left ? "arrow-icon is-left" : "arrow-icon"} viewBox="0 0 32 33" aria-hidden="true">
      <path d="M27 17H0M13.672 3l13.67 13.67-13.67 13.67" />
    </svg>
  );
}

function splitLines(text: string): string[] {
  return text.split("\n").filter(Boolean);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function makeCardPositions(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const columns = 9;
    const row = Math.floor(index / columns);
    const column = index % columns;
    const waveX = Math.sin(index * 1.71) * 2.8;
    const waveY = Math.cos(index * 2.13) * 3.4;
    return {
      x: 9 + column * 10.3 + waveX,
      y: 14 + row * 16.5 + waveY,
      rotate: ((index * 29) % 46) - 23,
      z: index,
    };
  });
}
