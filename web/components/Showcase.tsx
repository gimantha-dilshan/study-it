"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const screenshots = [
  {
    src: "/bot-ss-1.webp",
    title: "Solving Complex Equations",
    description: "Simply snap a photo and Study-It breaks down the solution step-by-step, explaining the logic behind every move."
  },
  {
    src: "/bot-ss-2.webp",
    title: "Interactive Voice Learning",
    description: "Send a voice note and get an instant, clear explanation. It's like having a tutor available 24/7."
  }
];

export default function Showcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % screenshots.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="showcase" className="relative py-32 px-4 sm:px-6 lg:px-8 z-10 border-t border-white/5 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text Content */}
          <div className="space-y-12 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider uppercase">
                Product Demo
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white glow-text">
                Real-World <br />
                <span className="text-indigo-400 font-black">Solutions.</span>
              </h2>
              <p className="text-xl text-gray-400 font-medium leading-relaxed max-w-xl">
                See exactly how Study-It handles complex student queries natively on WhatsApp with zero friction.
              </p>
            </motion.div>

            <div className="space-y-6">
              {screenshots.map((ss, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className={`p-6 rounded-[2rem] border transition-all duration-500 cursor-pointer ${currentIndex === idx
                    ? "bg-white/5 border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                    : "border-transparent opacity-50 hover:opacity-100 hover:bg-white/[0.02]"
                    }`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <div className="flex items-center gap-4 mb-2">
                    <div className={`w-2 h-2 rounded-full ${currentIndex === idx ? "bg-indigo-500 animate-pulse" : "bg-gray-600"}`} />
                    <h3 className="text-xl font-bold text-white tracking-tight">{ss.title}</h3>
                  </div>
                  <p className="text-gray-400 font-medium leading-relaxed pl-6 text-sm">
                    {ss.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Pure Interface Preview */}
          <div className="relative order-1 lg:order-2">

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[450px] mx-auto overflow-hidden rounded-[2.5rem] glass border border-white/10 shadow-2xl"
            >
              {/* Fake Window Header */}
              <div className="bg-white/[0.03] px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/40" />
                </div>
                <div className="text-[10px] font-black tracking-widest text-gray-500 uppercase">
                  Live Preview
                </div>
              </div>

              {/* Interface Content Container */}
              <div className="relative aspect-[3/4] md:aspect-[4/5] bg-black/40 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 1, scale: 1.05 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative w-full h-full p-4"
                  >
                    <Image
                      src={screenshots[currentIndex].src}
                      alt={screenshots[currentIndex].title}
                      fill
                      className="object-contain object-top rounded-2xl p-2"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer Decor */}
              <div className="bg-white/[0.03] p-4 text-center border-t border-white/10">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  WhatsApp Interface
                </p>
              </div>
            </motion.div>

            {/* Decorative Glow */}
            <div className="absolute -inset-10 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
}
