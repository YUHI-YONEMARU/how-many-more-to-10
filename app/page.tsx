'use client';

import { useState } from 'react';
import styles from './Home.module.css';
import Head from 'next/head';
import { motion } from "framer-motion";

type Mode = 'normal' | 'timeattack';

export default function Home() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [questionNumber, setQuestionNumber] = useState<number | null>(null);
  const [usedNumbers, setUsedNumbers] = useState<number[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number | null>(null);

  const pickNewQuestion = (used: number[]): number => {
    const available = [1,2,3,4,5,6,7,8,9].filter(n => !used.includes(n));
    return available[Math.floor(Math.random() * available.length)];
  };

  const handleSelectMode = (selected: Mode) => {
    const first = pickNewQuestion([]);
    setMode(selected);
    setQuestionNumber(first);
    setUsedNumbers([first]);
    setIsCorrect(false);
    setWrongAnswers([]);
    setIsGameOver(false);
    setElapsedTime(null);
    setStartTime(selected === 'timeattack' ? Date.now() : null);
  };

  const handleAnswerClick = (answer: number) => {
    if (!questionNumber || isCorrect) return;
    if (questionNumber + answer === 10) {
      setIsCorrect(true);
    } else {
      setWrongAnswers(prev => [...prev, answer]);
    }
  };

  const handleNextQuestion = () => {
    if (usedNumbers.length === 9) {
      if (mode === 'timeattack' && startTime !== null) {
        setElapsedTime(Date.now() - startTime);
      }
      setIsGameOver(true);
    } else {
      const next = pickNewQuestion(usedNumbers);
      setQuestionNumber(next);
      setUsedNumbers(prev => [...prev, next]);
      setIsCorrect(false);
      setWrongAnswers([]);
    }
  };

  const handleReset = () => {
    setMode(null);
    setQuestionNumber(null);
    setUsedNumbers([]);
    setIsCorrect(false);
    setWrongAnswers([]);
    setIsGameOver(false);
    setStartTime(null);
    setElapsedTime(null);
  };

  return (
    <main className={styles.container}>
      <Head>
        <title>10まであといくつ？</title>
        <meta name="description" content="「10まであといくつ？」は、足すと10になる数の組み合わせをゲーム形式で学べる子ども向けのアプリです。" />
        <meta name="keywords" content="とけいのよみかた, 子ども, 時計, 学習, 時間, アプリ" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#725bf4" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <meta property="og:title" content="10まであといくつ？" />
        <meta property="og:description" content="足すと10になる数の組み合わせをゲーム形式で学べる子ども向けのアプリです。" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://how-many-more-to-10.vercel.app" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="10まであといくつ？" />
        <meta name="twitter:description" content="足すと10になる数の組み合わせをゲーム形式で学べる子ども向けのアプリです。" />
        <meta name="twitter:image" content="/og-image.png" />
      </Head>

      <h1 className={styles.header}>10まであといくつ？</h1>

      {mode === null ? (
        <div className={styles.modeSelect}>
          <p className={styles.modeSelectLabel}>モードをえらんでね</p>
          <button className={styles.modeButton} onClick={() => handleSelectMode('normal')}>
            ふつう
          </button>
          <button className={`${styles.modeButton} ${styles.modeButtonTimeAttack}`} onClick={() => handleSelectMode('timeattack')}>
            タイムアタック
          </button>
        </div>
      ) : isGameOver ? (
        <div className={styles.gameArea}>
          <p className={styles.gameOverText}>もんだいはここまで。<br />おつかれさまでした！</p>
          {mode === 'timeattack' && elapsedTime !== null && (
            <p className={styles.elapsedTime}>
              {(elapsedTime / 1000).toFixed(1)}びょう
            </p>
          )}
          <button className={styles.nextButton} onClick={handleReset}>
            さいしょからにもどす
          </button>
        </div>
      ) : (
        <>
          <div className={styles.gameArea}>
            {questionNumber !== null && (
              <>
                <p className={styles.questionNumber}>{questionNumber}</p>
                <div className={styles.circleContainer}>
                  {Array.from({ length: questionNumber }).map((_, index) => (
                    <div key={`q-${index}`} className={`${styles.circle} ${styles.initialCircle}`}></div>
                  ))}
                  {isCorrect && Array.from({ length: 10 - questionNumber }).map((_, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      key={`a-${index}`}
                      className={`${styles.circle} ${styles.addedCircle}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {isCorrect ? (
            <div className={styles.nextButtonContainer}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className={styles.correctText}>せいかい！</p>
                <button className={styles.nextButton} onClick={handleNextQuestion}>
                  つぎのもんだいにすすむ
                </button>
              </motion.div>
            </div>
          ) : (
            <div className={styles.answerSection}>
              {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => {
                const isWrong = wrongAnswers.includes(num);
                return (
                  <button
                    key={num}
                    onClick={() => handleAnswerClick(num)}
                    disabled={isCorrect || isWrong}
                    className={styles.answerButton}
                  >
                    {isWrong ? `${num} ❌️` : num}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}