"use client";
// original

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ITEMS, BUCKET_IMAGE } from "./items-library"; // adjust path if needed
import { Pause, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/* -------------------
   Helper utilities
   ------------------- */
const uid = (prefix = "") =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? `${prefix}${crypto.randomUUID()}`
    : `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const pickUniqueRandom = (arr, count) => {
  const copy = [...arr];
  const res = [];
  while (res.length < count && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    res.push(copy.splice(i, 1)[0]);
  }
  return res;
};

/* -------------------
   Difficulty table -> returns [minSpeed, maxSpeed] (px/frame)
   Based on elapsed seconds
   ------------------- */
const getSpeedRangeForElapsed = (elapsedSec) => {
  if (elapsedSec < 30) return [1.8, 3.0];
  if (elapsedSec < 60) return [2.5, 4.0];
  if (elapsedSec < 90) return [3.2, 5.0];
  return [4.0, 6.0];
};

/* -------------------
   Subcomponents: TaskCard, CountdownOverlay, FailedCard, PauseCard
   Keep compact, responsive and accessible
   ------------------- */

function TaskCard({ task, onClose }) {
  // task = { collect: [items], avoid: [items], timeLimit }
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-5">
        <h3 className="text-xl font-bold text-center mb-2">New Task</h3>
        <p className="text-sm text-center text-gray-600 mb-4">
          Collect the <span className="font-semibold">income</span> items and avoid the{" "}
          <span className="font-semibold">expense</span> items below.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-semibold text-green-700 mb-2">Collect (5)</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {task.collect.map((it) => (
                <div
                  key={it.id}
                  className="flex flex-col items-center w-20 p-2 bg-green-50 rounded-lg"
                >
                  <Image src={it.icon} alt={it.id} width={48} height={48} />
                  <div className="text-xs mt-1">{it.id}</div>
                  <div className="text-xs font-semibold text-green-700">+{it.points}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <h4 className="text-sm font-semibold text-red-700 mb-2 items-center">Avoid (2)</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {task.avoid.map((it) => (
                <div
                  key={it.id}
                  className="flex flex-col items-center w-20 p-2 bg-red-50 rounded-lg"
                >
                  <Image src={it.icon} alt={it.id} width={48} height={48} />
                  <div className="text-xs mt-1">{it.id}</div>
                  <div className="text-xs font-semibold text-red-700">{it.points}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-5 py-2 rounded-md shadow hover:bg-indigo-700"
          >
            Ready — Show Countdown
          </button>
        </div>
      </div>
    </div>
  );
}

function CountdownOverlay({ count, visible }) {
  // show 3 -> 2 -> 1 -> GO
  if (!visible) return null;
  const text = count === 0 ? "GO" : String(count);
  const big = count === 0 ? "text-6xl" : "text-7xl";
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <div className="text-white text-center drop-shadow-lg p-4 bg-black/30 rounded-xl">
        <div className={`${big} font-extrabold`}>{text}</div>
      </div>
    </div>
  );
}


 function FailedCard({ score, onRetry, onQuit }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm"
      >
        <Card className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
          <CardContent className="p-6 flex flex-col items-center space-y-4">
            {/* Icon */}
            <div className="bg-red-100 rounded-full p-3 mb-1">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-extrabold text-gray-800 drop-shadow-sm">
              You Failed
            </h3>

            {/* Score */}
            <p className="text-gray-700 text-base">
              Your score:{" "}
              <span className="font-semibold text-gray-900">{score}</span>
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full">
              <Button
                onClick={onRetry}
                className="w-full sm:w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
              >
                Try Again
              </Button>
              <Button
                onClick={onQuit}
                variant="outline"
                className="w-full sm:w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl"
              >
                Quit
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function PauseCard({ onContinue, onQuit }) {
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-3">Game Paused</h3>
        <p className="text-gray-600 mb-6">Do you want to continue playing or quit the game?</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onContinue}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow"
          >
            Continue
          </button>
          <button
            onClick={onQuit}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg shadow"
          >
            Quit
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------
   Main GameClient
   ------------------- */
export default function GameClient() {
  // Game area refs
  const containerRef = useRef(null);
  const bucketRef = useRef(null);

  // Gameplay state
  const [falling, setFalling] = useState([]); // array of items {instanceId,...,x,y,speed}
  const [smokes, setSmokes] = useState([]);
  const [bucketX, setBucketX] = useState(0);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0); // seconds
  const elapsedRef = useRef(0);

  // Task management
  const [task, setTask] = useState(null); // {collect:[], avoid:[], timeLimit}
  const [taskTimeLeft, setTaskTimeLeft] = useState(0);
  const taskTimerRef = useRef(null);
  const [taskProgress, setTaskProgress] = useState({ collected: {}, remaining: 0 });
  const [showTaskCard, setShowTaskCard] = useState(true);

  // Flow control
  const [paused, setPaused] = useState(true); // pause physics while showing TaskCard or after failing
  const [countdown, setCountdown] = useState(null); // null or number (3..0)
  const [showCountdown, setShowCountdown] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [showPauseCard, setShowPauseCard] = useState(false);

  // Audio refs
  const bgAudio = useRef(null);
  const sfxCorrect = useRef(null);
  const sfxIncorrect = useRef(null);
  const [muted, setMuted] = useState(false);
  const [gameVolume, setGameVolume] = useState(0.6); // music volume (reduced)

  // spawn control
  const spawnIntervalRef = useRef(null);

  // initialize audio
  useEffect(() => {
    bgAudio.current = new Audio("/during-game.mp3");
    bgAudio.current.loop = true;
    bgAudio.current.volume = gameVolume;
    bgAudio.current.play().catch(() => {
      /* autoplay blocked until interaction */
    });

    sfxCorrect.current = new Audio("/collected-correct.mp3");
    sfxCorrect.current.volume = 0.9;

    sfxIncorrect.current = new Audio("/collected-incorrect.mp3");
    sfxIncorrect.current.volume = 0.9;

    return () => {
      bgAudio.current?.pause();
    };
  }, []); // run once

  // keep audio muted state in sync
  useEffect(() => {
    if (bgAudio.current) bgAudio.current.muted = muted;
    if (sfxCorrect.current) sfxCorrect.current.muted = muted;
    if (sfxIncorrect.current) sfxIncorrect.current.muted = muted;
  }, [muted]);

  // adjust bg volume when gameVolume changed
  useEffect(() => {
    if (bgAudio.current) bgAudio.current.volume = gameVolume;
  }, [gameVolume]);

  // device volume change reaction: try to listen to 'volumechange' on audio element (best-effort)
  // NOTE: there is no reliable cross-browser document-level device volume API. This is best-effort.
  useEffect(() => {
    const el = bgAudio.current;
    if (!el) return;
    const onVol = () => {
      // scale in-game music volume slightly based on bg audio volume
      setGameVolume(el.volume);
    };
    el.addEventListener("volumechange", onVol);
    return () => el.removeEventListener("volumechange", onVol);
  }, []);

  // center bucket on mount and on resize
  useEffect(() => {
    const setCenter = () => {
      const container = containerRef.current;
      if (!container) return;
      const { width } = container.getBoundingClientRect();
      setBucketX(width / 2);
    };
    setCenter();
    window.addEventListener("resize", setCenter);
    return () => window.removeEventListener("resize", setCenter);
  }, []);

  // keyboard controls
  useEffect(() => {
    const speed = 24; // px per keypress
    const handler = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const { width } = container.getBoundingClientRect();
      setBucketX((x) => {
        if (e.key === "ArrowLeft") return Math.max(40, x - speed);
        if (e.key === "ArrowRight") return Math.min(width - 40, x + speed);
        return x;
      });
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // touch move (mobile)
  useEffect(() => {
    const onTouch = (e) => {
      const container = containerRef.current;
      if (!container) return;
      const { left, width } = container.getBoundingClientRect();
      const tx = e.touches[0].clientX - left;
      setBucketX(Math.min(Math.max(tx, 40), width - 40));
    };
    window.addEventListener("touchmove", onTouch);
    return () => window.removeEventListener("touchmove", onTouch);
  }, []);

  // spawn loop (pausable). Special items spawn rarely (5%).
  useEffect(() => {
    const spawn = () => {
      if (paused) return;
      const container = containerRef.current;
      if (!container) return;
      const { width } = container.getBoundingClientRect();

      // Special spawn low chance (5%)
      const specialChance = Math.random() < 0.05;
      let candidate;
      if (specialChance) {
        const specials = ITEMS.filter((i) => i.type === "special");
        candidate = specials[Math.floor(Math.random() * specials.length)];
      } else {
        candidate = ITEMS[Math.floor(Math.random() * ITEMS.length)];
      }

      const [minSpeed, maxSpeed] = getSpeedRangeForElapsed(elapsedRef.current);
      const baseSpeed = Math.random() * (maxSpeed - minSpeed) + minSpeed;

      const instance = {
        ...candidate,
        instanceId: uid(candidate.id + "-"),
        x: Math.random() * (width - 80) + 40,
        y: -60,
        speed: baseSpeed,
      };

      setFalling((prev) => [...prev, instance]);
    };

    // spawn frequency depends on elapsed (faster as time goes)
    const baseSpawnMs = 900; // keeps gameplay reasonable; can be adjusted
    spawnIntervalRef.current = setInterval(spawn, baseSpawnMs);

    return () => clearInterval(spawnIntervalRef.current);
  }, [paused]);

  // animate falling items (requestAnimationFrame)
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (!paused) {
        setFalling((prev) =>
          prev
            .map((it) => ({ ...it, y: it.y + it.speed }))
            .filter((it) => typeof it.y === "number" && it.y < window.innerHeight + 120)
        );
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  // collision detection loop
  useEffect(() => {
    const id = setInterval(() => {
      if (paused) return;
      const bucketRect = bucketRef.current?.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!bucketRect || !containerRect) return;

      setFalling((prev) => {
        const survivors = [];
        const newSmokes = [];
        prev.forEach((it) => {
          const itemBottom = it.y + 24;
          const itemLeft = it.x + containerRect.left;
          // bucketRect usage
          if (
            itemBottom >= bucketRect.top &&
            itemBottom <= bucketRect.bottom &&
            itemLeft >= bucketRect.left &&
            itemLeft <= bucketRect.right
          ) {
            // collected
            newSmokes.push({
              id: `${it.instanceId}-smk-${Math.random().toString(36).slice(2, 6)}`,
              x: it.x,
              y: bucketRect.top - containerRect.top + 8,
            });

            // handle scoring & task logic
            handleItemCollected(it);
          } else {
            survivors.push(it);
          }
        });

        if (newSmokes.length) {
          setSmokes((s) => [...s, ...newSmokes].slice(-20));
          // clear smokes after short time
          setTimeout(() => setSmokes((s) => s.slice(newSmokes.length)), 700);
        }

        return survivors;
      });
    }, 60);

    return () => clearInterval(id);
  }, [paused, task, score]); // include task & score to have latest closures

  // elapsed timer
  useEffect(() => {
    const t = setInterval(() => {
      if (!paused) {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [paused]);

  // Task timer (countdown to complete task)
  useEffect(() => {
    if (!task) return;
    // reset local trackers
    setTaskProgress({ collected: {}, remaining: task.collect.length });
    setTaskTimeLeft(task.timeLimit);
    if (taskTimerRef.current) clearInterval(taskTimerRef.current);

    taskTimerRef.current = setInterval(() => {
      if (paused) return;
      setTaskTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(taskTimerRef.current);
          // Task failed due to timeout -> generate new task and show TaskCard
          createNewTaskAndPause();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(taskTimerRef.current);
  }, [task, paused]);

  /* -------------------
     Game logic: tasks, collections, fail/complete
     ------------------- */

  // createTask: choose 5 income, 2 expense
  const createTask = () => {
    const incomes = ITEMS.filter((i) => i.type === "income");
    const expenses = ITEMS.filter((i) => i.type === "expense");

    const collect = pickUniqueRandom(incomes, 5);
    const avoid = pickUniqueRandom(expenses, 2);
    // timeLimit for task: make it dynamic or constant (we use 30 seconds by default)
    const timeLimit = 30;

    return { collect, avoid, timeLimit };
  };

  // helper to show TaskCard (pause gameplay)
  const showTaskCardForNewTask = (t = null) => {
    const newTask = t || createTask();
    setTask(newTask);
    setShowTaskCard(true);
    setPaused(true);
    setCountdown(null);
    setShowCountdown(false);
    // keep music playing (do not pause audio)
  };

  // used when timeout or after completion we want a fresh task and pause
  const createNewTaskAndPause = () => {
    showTaskCardForNewTask();
  };

  // called when the user clicks Ready on TaskCard
  const startAfterTaskCard = () => {
    setShowTaskCard(false);
    // start countdown 3..2..1..GO
    setShowCountdown(true);
    setCountdown(3);
    setPaused(true);
    const cId = setInterval(() => {
      setCountdown((c) => {
        if (c === null) return null;
        if (c > 1) return c - 1;
        // when c === 1 -> next is 0 (GO)
        clearInterval(cId);
        // show GO for a short time then unpause
        setCountdown(0);
        setTimeout(() => {
          setShowCountdown(false);
          setCountdown(null);
          setPaused(false);
        }, 700);
        return 0;
      });
    }, 700);
  };

  // when collecting an item: modify score and task progress
  const handleItemCollected = (item) => {
    // if item is expense and is part of current task.avoid -> fail immediately
    if (task && task.avoid.some((a) => a.id === item.id)) {
      // play incorrect sfx
      sfxIncorrect.current?.play?.();
      // reduce score by item.points (points negative)
      setScore((s) => Math.max(0, s + item.points));
      // mark failure
      setShowFailed(true);
      setPaused(true);
      return;
    }

    // normal scoring
    setScore((s) => s + item.points);

    // play correct sfx for income or special
    if (item.type === "income" || item.type === "special") {
      sfxCorrect.current?.play?.();
    } else {
      // expense but not in avoid list -> penalty
      sfxIncorrect.current?.play?.();
    }

    // if part of current task.collect -> mark as collected
    if (task && task.collect.some((c) => c.id === item.id)) {
      setTaskProgress((prev) => {
        if (prev.collected[item.id]) return prev; // already counted
        const newCollected = { ...prev.collected, [item.id]: true };
        const remaining = Math.max(0, task.collect.length - Object.keys(newCollected).length);
        // If task completed:
        if (remaining === 0) {
          // Pause and show task complete card; create new task after user closes
          setPaused(true);
          // Small delay then show the TaskCard again (simulate success popup)
          setTimeout(() => {
            showTaskCardForNewTask();
          }, 700);
        }
        return { collected: newCollected, remaining };
      });
    }

    // If score reaches 0 after deduction, show failed
    setScore((prev) => {
    const newScore = Math.max(0, prev + item.points);

    if (newScore <= 0) {
        setShowFailed(true);
        setPaused(true);
    }

    return newScore;
    });

  };

  // initial task creation on mount
  useEffect(() => {
    showTaskCardForNewTask();
  }, []);

  // retry game
  const handleRetry = () => {
    // reset state
    setFalling([]);
    setSmokes([]);
    setBucketX(containerRef.current?.getBoundingClientRect().width / 2 || 0);
    setScore(0);
    setElapsed(0);
    elapsedRef.current = 0;
    setShowFailed(false);
    showTaskCardForNewTask();
  };

  // quit -> navigate back to dashboard or landing (simple: reload to root)
  const handleQuit = () => {
    // For now redirect to dashboard (adjust route as needed)
    window.location.href = "/dashboard";
  };

  // mute toggle
  const toggleMute = () => setMuted((m) => !m);

  // pause game
  const handlePause = () => {
    setPaused(true);
    setShowPauseCard(true);
  }

  // continue game
  const handleContinue = () => {
    setShowPauseCard(false);
    setPaused(false);
  }

  /* -------------------
     Render
     ------------------- */
  // Right-side tasks UI derived state: show gray icons for uncollected
  const taskCollectIds = useMemo(() => (task ? task.collect.map((c) => c.id) : []), [task]);
  const taskAvoidIds = useMemo(() => (task ? task.avoid.map((a) => a.id) : []), [task]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-50 to-blue-200">
      {/* Game container (center) */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        style={{ touchAction: "none" }}
      >
        {/* Top HUD */}
        <div className="absolute left-4 top-4 z-40 flex items-center gap-3">
          <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow">
              <div className="text-xs text-gray-500">Score: <span className="font-bold">{score}</span></div>
              <div className="text-xs text-gray-500">Time: <span className="font-bold text-red-700">{taskTimeLeft}s</span></div>
          </div>
        </div>

     
        {/* Right tasks + mute */}
        <div className="absolute right-4 top-4 z-40 flex flex-col items-end gap-2">
          <div className="bg-white/80 p-2 rounded-lg shadow flex gap-2 items-center">
            <div className="text-xs text-gray-600 mr-2">Tasks</div>
            <div className="grid grid-cols-1 gap-1">
              <div className="flex gap-1 items-center">
                {task &&
                  task.collect.map((it) => {
                    const collected = taskProgress.collected[it.id];
                    return (
                      <div key={it.id} className="w-10 h-10 rounded-md overflow-hidden bg-white flex items-center justify-center"
                           title={`${it.id} +${it.points}`}>
                        <Image
                          src={it.icon}
                          alt={it.id}
                          width={36}
                          height={36}
                          className={`transition-filter ${collected ? "filter-none" : "filter grayscale opacity-60"}`}
                        />
                      </div>
                    );
                  })}
              </div>
              <div className="flex gap-1 items-center mt-1">
                {task &&
                  task.avoid.map((it) => (
                    <div key={it.id} className="w-10 h-10 rounded-md overflow-hidden bg-white flex items-center justify-center"
                         title={`${it.id} ${it.points}`}>
                      <Image src={it.icon} alt={it.id} width={36} height={36}
                             className="filter grayscale opacity-40" />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* mute button */}
          <button
            className="mt-2 bg-white/80 p-2 rounded-full shadow"
            onClick={toggleMute}
            aria-label="Mute"
          >
            {muted ? "🔇" : "🔊"}
          </button>

          {/* pause button */}
          <button
            className="bg-white/80 p-2 rounded-full shadow mt-1"
            onClick={handlePause}
            aria-label="Pause"
          >
           <Pause className="h-5 w-5 text-gray-800"/>
          </button>
        </div>

        {/* Overlays */}
        {showPauseCard && (
          <PauseCard onContinue={handleContinue} onQuit={handleQuit}/>
        )}

        {/* Falling items */}
        {falling.map((it) => (
          <div
            key={it.instanceId}
            style={{
              position: "absolute",
              left: it.x,
              top: it.y,
              transform: "translate(-50%, -50%)",
              width: 44,
              height: 44,
              pointerEvents: "none",
              zIndex: 20,
            }}
          >
            <Image src={it.icon} alt={it.id} width={44} height={44} className="drop-shadow-md" />
          </div>
        ))}

        {/* smoke effects */}
        {smokes.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-gray-300 opacity-70 animate-puff"
            style={{
              left: s.x,
              top: s.y,
              width: 30,
              height: 30,
              transform: "translate(-50%, -50%)",
              zIndex: 30,
            }}
          />
        ))}

        {/* Bucket */}
        <div
          ref={bucketRef}
          className="absolute bottom-6 sm:bottom-10 transition-transform duration-75"
          style={{ left: bucketX - 45 }}
        >
          <Image src={BUCKET_IMAGE} alt="bucket" width={90} height={90} draggable={false} className="drop-shadow-xl" />
        </div>

        {/* Countdown overlay */}
        <CountdownOverlay count={countdown} visible={showCountdown} />

        {/* TaskCard and FailedCard overlays */}
        {showTaskCard && task && <TaskCard task={task} onClose={startAfterTaskCard} />}
        {showFailed && (
          <FailedCard
            score={score}
            onRetry={() => {
              setShowFailed(false);
              handleRetry();
            }}
            onQuit={handleQuit}
          />
        )}
      </div>

      {/* Styles for smoke puff */}
      <style jsx>{`
        @keyframes puff {
          0% {
            transform: scale(1) translate(-50%, -50%);
            opacity: 0.7;
          }
          100% {
            transform: scale(2) translate(-50%, -50%);
            opacity: 0;
          }
        }
        .animate-puff {
          animation: puff 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
