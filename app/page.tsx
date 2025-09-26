'use client';

import { useState, useEffect } from 'react';
import styles from './Home.module.css'; // CSSモジュールをインポート
import { motion } from "framer-motion";

export default function Home() {
  const [questionNumber, setQuestionNumber] = useState<number | null>(null);
  const [usedNumbers, setUsedNumbers] = useState<number[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // 新しい問題を開始またはゲームをリセットする関数
  const startNewGame = () => {
    const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const availableNumbers = allNumbers.filter(n => !usedNumbers.includes(n));

    if (availableNumbers.length === 0) {
      setIsGameOver(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const newNumber = availableNumbers[randomIndex];

    setQuestionNumber(newNumber);
    setUsedNumbers(prev => [...prev, newNumber]);
    setIsCorrect(false);
    setWrongAnswers([]);
  };

  // コンポーネントが最初に読み込まれた時にゲームを開始
  useEffect(() => {
    startNewGame();
  }, []);

  // 回答ボタンが押された時の処理
  const handleAnswerClick = (answer: number) => {
    if (!questionNumber || isCorrect) return;

    if (questionNumber + answer === 10) {
      setIsCorrect(true);
    } else {
      setWrongAnswers(prev => [...prev, answer]);
    }
  };

  // 「つぎのもんだいにすすむ」ボタンが押された時の処理
  const handleNextQuestion = () => {
    if (usedNumbers.length === 9) {
      setIsGameOver(true);
    } else {
      startNewGame();
    }
  };
  
  // 「リセット」ボタンが押された時の処理
  const handleReset = () => {
    setUsedNumbers([]);
    setIsGameOver(false);
    // stateの更新が非同期なため、一時変数で初期化
    const allNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const randomIndex = Math.floor(Math.random() * allNumbers.length);
    const newNumber = allNumbers[randomIndex];

    setQuestionNumber(newNumber);
    setUsedNumbers([newNumber]);
    setIsCorrect(false);
    setWrongAnswers([]);
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.header}>10まであといくつ？</h1>

      {isGameOver ? (
        <div className={styles.gameArea}>
          <p className={styles.gameOverText}>もんだいはここまで。<br />おつかれさまでした！</p>
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
                  {/* 問題の数字の数だけ丸を表示 */}
                  {Array.from({ length: questionNumber }).map((_, index) => (
                    <div key={`q-${index}`} className={`${styles.circle} ${styles.initialCircle}`}></div>
                  ))}
                  {/* 正解した場合、残りの丸を追加表示 */}
                  {isCorrect && Array.from({ length: 10 - questionNumber }).map((_, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        key={`a-${index}`} className={`${styles.circle} ${styles.addedCircle}`}
                    > 
                    </motion.div>
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
                const isDisabled = isCorrect || isWrong;
                return (
                  <button
                    key={num}
                    onClick={() => handleAnswerClick(num)}
                    disabled={isDisabled}
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