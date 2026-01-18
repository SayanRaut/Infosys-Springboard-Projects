import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { FiChevronsRight, FiCheck } from "react-icons/fi";

export default function SlideButton({ onSlideComplete, isSuccess, reset }) {
  const [dragged, setDragged] = useState(false);
  const containerRef = useRef(null);
  const [dragLimit, setDragLimit] = useState(0);
  
  const x = useMotionValue(0);
  // Fade out text as we slide
  const textOpacity = useTransform(x, [0, dragLimit - 40], [1, 0]);
  
  // 1. Calculate the drag limit dynamically
  useEffect(() => {
    if (containerRef.current) {
      // Container width - Knob width (56px) - Padding (8px total)
      const limit = containerRef.current.offsetWidth - 56 - 8;
      setDragLimit(limit);
    }
    
    // Optional: Recalculate on resize
    const handleResize = () => {
        if(containerRef.current) {
            setDragLimit(containerRef.current.offsetWidth - 64);
        }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Handle Reset
  useEffect(() => {
    if (reset || !isSuccess) {
      animate(x, 0, { duration: 0.5, type: "spring" });
      setDragged(false);
    }
  }, [reset, isSuccess, x]);

  const handleDragEnd = () => {
    if (x.get() > dragLimit - 10) { // Threshold: close to the end
      setDragged(true);
      animate(x, dragLimit, { duration: 0.2 }); // Snap to exact end
      onSlideComplete();
    } else {
      // Snap back to start
      animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
      setDragged(false);
    }
  };

  return (
    <div 
        ref={containerRef}
        className="relative h-16 bg-[#0f172a] rounded-full border border-slate-700 overflow-hidden shadow-inner select-none w-full"
    >
      {/* Background Text */}
      <motion.div 
        style={{ opacity: textOpacity }}
        className="absolute inset-0 flex items-center justify-center text-slate-500 font-medium tracking-wide pointer-events-none"
      >
        {isSuccess ? "Sent Successfully!" : "Slide to send"}
      </motion.div>

      {/* Success Fill Layer */}
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: isSuccess ? "100%" : x.get() + 56 }}
        className="absolute top-0 left-0 h-full bg-emerald-500/20"
      />

      {/* The Draggable Knob */}
      <motion.div
        drag={!dragged && !isSuccess ? "x" : false}
        dragConstraints={{ left: 0, right: dragLimit }} // Dynamic constraint
        dragElastic={0.05}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`absolute top-1 left-1 w-14 h-14 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20 shadow-lg transition-colors duration-300 ${
            isSuccess 
              ? "bg-emerald-500 text-white cursor-default" 
              : "bg-gradient-to-r from-emerald-400 to-emerald-600 text-white"
        }`}
      >
        {isSuccess ? <FiCheck size={24} /> : <FiChevronsRight size={28} className="animate-pulse" />}
      </motion.div>
    </div>
  );
}