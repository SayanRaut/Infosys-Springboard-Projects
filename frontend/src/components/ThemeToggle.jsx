import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative w-16 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none shadow-lg border
        ${theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-orange-100 border-orange-200"}
      `}
            aria-label="Toggle Theme"
        >
            <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center
          ${theme === "dark" ? "translate-x-8 bg-slate-900 text-indigo-400" : "translate-x-0 bg-white text-orange-500"}
        `}
            >
                {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
            </div>
        </button>
    );
}
