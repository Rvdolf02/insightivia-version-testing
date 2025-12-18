"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ITEMS, BUCKET_IMAGE } from "./items-library";

// 💨 Smoke effect
const Smoke = ({ x, y }) => (
  <div
    className="absolute rounded-full bg-gray-300 opacity-70 animate-puff"
    style={{
      left: x,
      top: y,
      width: 30,
      height: 30,
      transform: "translate(-50%, -50%)",
    }}
  />
);

export default function AutoPlayDemo() {
  const [fallingItems, setFallingItems] = useState([]);
  const [smokes, setSmokes] = useState([]);
  const [bucketX, setBucketX] = useState(0);
  const containerRef = useRef(null);
  const bucketRef = useRef(null);

  // 🧭 Align bucket to center of container
  useEffect(() => {
    if (!containerRef.current) return;
    const { width } = containerRef.current.getBoundingClientRect();
    setBucketX(width / 2);
  }, []);

  const speed = 15;

  // ⌨️ Move bucket left/right
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!containerRef.current) return;
      const { width } = containerRef.current.getBoundingClientRect();

      setBucketX((x) => {
        if (e.key === "ArrowLeft") return Math.max(40, x - speed);
        if (e.key === "ArrowRight") return Math.min(width - 40, x + speed);
        return x;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 🎲 Spawn falling items
  useEffect(() => {
    const interval = setInterval(() => {
      if (!containerRef.current) return;
      const { width } = containerRef.current.getBoundingClientRect();
      const randomItem = ITEMS[Math.floor(Math.random() * ITEMS.length)];

      const uniqueId = `${randomItem.id}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      setFallingItems((prev) => [
        ...prev,
        {
          ...randomItem,
          instanceId: uniqueId,
          x: Math.random() * (width - 80) + 40,
          y: -60,
          speed: Math.random() * 1.2 + 3.0,
        },
      ]);
    }, 900);

    return () => clearInterval(interval);
  }, []);

  // 🪂 Animate falling
  useEffect(() => {
    let animationId;
    const animate = () => {
      setFallingItems((prev) =>
        prev
          .map((item) => ({
            ...item,
            y: item.y + item.speed,
          }))
          .filter((item) => item.y < window.innerHeight + 100)
      );
      animationId = requestAnimationFrame(animate);
    };
    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // 🎯 Collision detection (fixed smoke key duplication)
  useEffect(() => {
    const interval = setInterval(() => {
      const bucket = bucketRef.current?.getBoundingClientRect();
      const container = containerRef.current?.getBoundingClientRect();
      if (!bucket || !container) return;

      setFallingItems((prev) => {
        const survivors = [];
        const newSmokes = [];

        prev.forEach((item) => {
          const itemBottom = item.y + 20;
          const itemX = item.x + container.left;

          if (
            itemBottom >= bucket.top &&
            itemBottom <= bucket.bottom &&
            itemX >= bucket.left &&
            itemX <= bucket.right
          ) {
            // Ensure unique smoke IDs even in fast collisions
            const smokeId = `${item.instanceId}-smoke-${Math.random()
              .toString(36)
              .slice(2, 6)}`;

            newSmokes.push({
              id: smokeId,
              x: item.x,
              y: bucket.top - container.top + 10,
            });
          } else {
            survivors.push(item);
          }
        });

        if (newSmokes.length > 0)
          setSmokes((s) => [...s, ...newSmokes].slice(-15));

        return survivors;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // 📱 Move bucket via touch
  useEffect(() => {
    const handleTouchMove = (e) => {
      if (!containerRef.current) return;
      const { left, width } = containerRef.current.getBoundingClientRect();
      const touchX = e.touches[0].clientX - left;
      setBucketX(Math.min(Math.max(touchX, 40), width - 40));
    };
    window.addEventListener("touchmove", handleTouchMove);
    return () => window.removeEventListener("touchmove", handleTouchMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
    >
      {/* 🪙 Falling items */}
      {fallingItems.map((item) => (
        <Image
          key={item.instanceId}
          src={item.icon}
          alt={item.id}
          width={40}
          height={40}
          className="absolute select-none pointer-events-none drop-shadow-md"
          style={{
            left: item.x,
            top: item.y,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* 💨 Smoke effect */}
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

      {/* 🪣 Bucket */}
      <div
        ref={bucketRef}
        className="absolute bottom-6 sm:bottom-10 transition-transform duration-75"
        style={{ left: bucketX - 45 }}
      >
        <Image
          src={BUCKET_IMAGE}
          alt="bucket"
          width={90}
          height={90}
          className="drop-shadow-xl"
          draggable={false}
          priority
        />
      </div>

      {/* 🔥 Smoke animation */}
      <style jsx global>{`
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
