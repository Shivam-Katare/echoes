"use client";

import React, { useEffect, useState } from "react";
import usePlayStore from "@/store/playStore";
import TimesUpDialog from "@/components/dialogs/timesup-dialog";
import { List, Volume2, VolumeOff } from "lucide-react";
import useLeaderboardStore from "@/store/leaderboardStore";
import { useSession } from "@clerk/nextjs";
import { useUser } from '@clerk/nextjs';
import { BackgroundParticles } from "@/components/background-particles";
import SelectTypingCategoryDialog from "@/components/dialogs/select-typing-category-dialog";
import { Toaster } from "react-hot-toast";
import useGameSettingsStore from "@/store/useGameSettings";
import { categoryGradients } from "@/lib/utils";
import { playfair } from "../../layout";
import WordsTypingArea from "./WordsTypingArea";
import TopUserLeaderboard from "./TopUserLeaderboard";
import SentenceTyping from "./SentenceTyping";
import { getRandomWords } from './utils';
import { Howl } from 'howler';

const correctSound = new Howl({
  src: ['/audio/correct.mp3']
});

const incorrectSound = new Howl({
  src: ['/audio/incorrect.mp3']
});

function Story() {
  const [input, setInput] = useState("");
  const { words, paras, fetchWords, fetchParas } = usePlayStore(); 
  const { difficulty, category, challangeType, time } = useGameSettingsStore();
  const [displayWords, setDisplayWords] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [timer, setTimer] = useState(parseInt(time));
  const [recentWords, setRecentWords] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const { fetchLeaderboard, leaderboard, saveLeaderboard, isLoading, fetchGlobalLeaderboard, globalLeaderboard } = useLeaderboardStore();
  const user = useUser().user;
  const user_id = user?.id ?? '';
  const userProfile = user?.imageUrl ?? '';
  const { session } = useSession();
  const [bgGradient, setBgGradient] = useState(
    `linear-gradient(360deg, hsla(197, 24%, 94%, 1) 0%, hsla(34, 100%, 71%, 1) 58%, hsla(44, 83%, 62%, 1) 93%, hsla(45, 99%, 49%, 1) 100%)`
  ); // Default gradient
  const [animationClass, setAnimationClass] = useState('');
  const bgStyles = {
    glassmorphism: {
      backdropFilter: "blur(10px)",
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.18)",
    },
  };

  const [isFirstDialogOpen, setIsFirstDialogOpen] = useState(false);

  // States for SentenceTyping
  const [text, setText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    const soundInstance = new Howl({
      src: ['/audio/credsbg.mp3'],
      autoplay: true,
      loop: true,
      volume: 0.03,
    });

    setSound(soundInstance);

    // Cleanup Howler instance on component unmount
    return () => {
      soundInstance.stop();
    };
  }, []);

  const togglePlay = () => {
    if (sound) {
      if (isPlaying) {
        sound.pause();
      } else {
        sound.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStartGame = () => {
    setShowCountdown(true);
  };


  const handleTimerComplete = async () => {
    setIsDialogOpen(true);
    setIsGameActive(false);
    setShowCountdown(false);
    setCountdown(3);
    if (session) {
      const payload = {
        userName: user?.fullName ?? '',
        difficulty,
        words_typed: correctCount + incorrectCount,
        correct_words_typed: correctCount,
        incorrect_words_typed: incorrectCount,
      }
      await saveLeaderboard(session, user_id, payload);
    }
    return [false, 0];
  };

  // Restart game
  const handleRestart = () => {
    setTimer(parseInt(time));
    setCorrectCount(0);
    setIncorrectCount(0);
    setInput("");
    const initialWords = getRandomWords(words);
    setDisplayWords(initialWords);
    setRecentWords(initialWords.map((wordObj) => wordObj.word));
    setIsDialogOpen(false);
    setIsGameActive(false);
    setText('');
    setCurrentText('');
    if (challangeType === 'paragraphs') {
        fetchParas(session);
    } else {
        fetchWords(session, difficulty);
    }
    // initializeGame();
  };

  // Input logic
  const handleInputChange = (e) => setInput(e.target.value);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && displayWords.length > 0 && input.trim()) {
        e.preventDefault(); // Prevent default enter behavior
        
        const currentWord = displayWords[0]?.word;
        const isCorrect = input.trim() === currentWord;

        // Update scores immediately to prevent race conditions
        if (isCorrect) {
            correctSound.play();
            setCorrectCount((prev) => prev + 1);
        } else {
            incorrectSound.play();
            setIncorrectCount((prev) => prev + 1);
        }

        // Clear input immediately
        setInput("");

        // Use functional updates to ensure state consistency
        setDisplayWords((prevWords) => {
            // Safety check for empty array
            if (prevWords.length === 0) return prevWords;

            const newWords = [...prevWords.slice(1)];

            // Generate new word with retry mechanism
            const getNewWord = () => {
                const maxAttempts = 10;
                let attempts = 0;
                let nextWord;

                while (attempts < maxAttempts) {
                    nextWord = words[Math.floor(Math.random() * words.length)];
                    if (!recentWords.includes(nextWord.word)) {
                        break;
                    }
                    attempts++;
                }

                // Fallback if no unique word found
                return nextWord || words[Math.floor(Math.random() * words.length)];
            };

            const nextWord = getNewWord();
            newWords.push(nextWord);

            // Update recent words history
            setRecentWords((prevHistory) => {
                const updatedHistory = [...prevHistory.slice(-4), nextWord.word];
                return updatedHistory;
            });

            return newWords;
        });
    }
};

const handleSentenceInput = (e) => {
  const value = e.target.value;
  let newValue = value;
  
  // Compare the current input with the target text
  for (let i = 0; i < value.length; i++) {
      // Play sound only when a new character is typed
      if (i === value.length - 1) {
          if (value[i] === text[i]) {
              correctSound.play();
          } else {
              incorrectSound.play();
              setIncorrectCount(prev => prev + 1);
          }
      }
  }

  setCurrentText(newValue);
  
  // Count correct characters
  let correctChars = 0;
  for (let i = 0; i < newValue.length; i++) {
      if (newValue[i] === text[i]) {
          correctChars++;
      }
  }
  setCorrectCount(correctChars);

  // Check if the sentence is completed
  if (newValue === text) {
      // Generate new sentence
      let newText;
      do {
          newText = paras[Math.floor(Math.random() * paras.length)].para;
      } while (newText === text);

      // Set the new sentence and reset the states
      setText(newText);
      setCurrentText('');
      setCorrectCount(0);
      setIncorrectCount(0);
  }
};


  const handleChangeColor = () => {
    if (category?.name) {
      // Trigger fade-out animation
      setAnimationClass('fade-out');
      setTimeout(() => {
        // Update gradient and trigger fade-in
        setBgGradient(categoryGradients[category.name] || bgGradient);
        setAnimationClass('fade-in');
      }, 500); // Match this to the CSS animation duration
    }
  };

  useEffect(() => {
    if (!session) return;
    fetchGlobalLeaderboard(session);
  }, [session, fetchLeaderboard]);

  useEffect(() => {
    if (challangeType === 'words') {
      fetchWords(session, difficulty);
    } 
    if (challangeType === 'paragraphs') {
      fetchParas(session);
    }
  }, [difficulty, fetchWords, fetchParas, challangeType]);

  // Initialize the first set of words
  useEffect(() => {
    if (words.length > 0) {
        const initialWords = getRandomWords(words);
        setDisplayWords(initialWords);
        setRecentWords(initialWords.map((wordObj) => wordObj.word));
    }
}, [words]);

  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1500);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setIsGameActive(true);
      setShowCountdown(false);
      setCountdown(3);
    }
  }, [countdown, showCountdown]);

  useEffect(() => {
    if (!isFirstDialogOpen) {
      setIsFirstDialogOpen(true);
    }
  }, [])

  useEffect(() => {
    let intervalId;

    if (isGameActive && timer > 0) {
      intervalId = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isGameActive, timer]);


  useEffect(() => {
    if (showCountdown && paras && paras.length > 0) {
      const para = paras[0].para;
      setText(para);

      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setShowCountdown(false);
            setIsGameActive(true);
            clearInterval(countdownInterval);
            return 3;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [showCountdown, paras]);

  return (
    <main className={`min-h-screen pb-8 ${animationClass} gradient-hero-4`}

      style={{
        transition: 'opacity 0.5s ease-in-out',
      }}

    >
      <BackgroundParticles />
      <div className="absolute top-4 left-4 flex items-center gap-4 z-50 mt-16">
        <button
          aria-label="Toggle Music"
          onClick={togglePlay}
          className="p-2 bg-white/80 rounded-full shadow-lg hover:bg-white/90 transition duration-300"
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
           {isPlaying ? (
            <Volume2 size={24} className="text-black" />
          ) : (
            <VolumeOff size={24} className="text-black" />
          )}
        </button>
        <button
          aria-label="Select Typing Category"
          onClick={() => setIsFirstDialogOpen(true)}
          className="p-2 bg-white/80 rounded-full shadow-lg hover:bg-white/90 transition duration-300"
        >
          <List className="h-6 w-6 text-black" />
        </button>
      </div>
      <div className="mx-auto max-w-3xl px-4 relative z-10 sm:px-6 lg:max-w-7xl lg:px-8">
        {/* Main 3 column grid */}
        {
          challangeType === 'words' ? (
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
              {/* Left column */}
              <div className="mt-24 grid grid-cols-1 gap-4 lg:col-span-2">
                <section aria-labelledby="section-1-title">
                  <div className="overflow-hidden rounded-lg shadow" style={bgStyles.glassmorphism}>
                    <div className="p-6">
                      <WordsTypingArea
                        isGameActive={isGameActive}
                        showCountdown={showCountdown}
                        countdown={countdown}
                        displayWords={displayWords}
                        input={input}
                        handleStartGame={handleStartGame}
                        handleInputChange={handleInputChange}
                        handleKeyPress={handleKeyPress}
                        handleRestart={handleRestart}
                        handleTimerComplete={handleTimerComplete}
                        timer={timer}
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Right column */}
              <div className="mt-16 grid grid-cols-1 gap-4">
                <section aria-labelledby="section-2-title">
                  <h2 id="section-2-title" className={`${playfair.className}text-white text-center font-extrabold text-[20px]`}>
                    Leaderboard
                  </h2>
                  <div className="overflow-hidden rounded-lg shadow" style={bgStyles.glassmorphism}>
                    <div className="p-6">
                      <TopUserLeaderboard
                        isLoading={isLoading}
                        globalLeaderboard={globalLeaderboard}
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <SentenceTyping
              isGameActive={isGameActive}
              showCountdown={showCountdown}
              countdown={countdown}
              text={text}
              currentText={currentText}
              handleInputChange={handleSentenceInput}
              handleRestart={handleRestart}
              setShowCountdown={setShowCountdown}
              handleTimerComplete={handleTimerComplete}
              timer={timer}
            />
          )
        }

      </div>
      <TimesUpDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        playData={{ typedWords: correctCount + incorrectCount, correctCount, incorrectCount, time: parseInt(time) - timer }}
        restartGame={handleRestart}
        isLoading={false}
      />

      <SelectTypingCategoryDialog
        isOpen={isFirstDialogOpen}
        onClose={() => setIsFirstDialogOpen(false)}
        onConfirm={() => setIsFirstDialogOpen(false)}
        changeColor={handleChangeColor}
      />

      <Toaster />
    </main>

  );
}

export default Story;
