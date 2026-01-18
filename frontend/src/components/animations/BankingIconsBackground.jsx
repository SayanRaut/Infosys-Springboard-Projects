import React, { useEffect, useState } from 'react';
import { Coins, TrendingUp, ShieldCheck, Wallet, Banknote, CreditCard, PieChart, Landmark } from 'lucide-react';

const icons = [Coins, TrendingUp, ShieldCheck, Wallet, Banknote, CreditCard, PieChart, Landmark];

export default function BankingIconsBackground() {
    const [elements, setElements] = useState([]);

    useEffect(() => {
        // Generate random floating elements
        const newElements = Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            Icon: icons[Math.floor(Math.random() * icons.length)],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: Math.floor(Math.random() * 30) + 20, // 20px to 50px
            duration: Math.floor(Math.random() * 20) + 10, // 10s to 30s
            delay: Math.random() * 5,
            direction: Math.random() > 0.5 ? 1 : -1,
        }));
        setElements(newElements);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {elements.map((el) => (
                <div
                    key={el.id}
                    className="absolute opacity-10 dark:opacity-5 text-slate-800 dark:text-white transition-colors duration-500"
                    style={{
                        left: el.left,
                        top: el.top,
                        animation: `float-${el.id} ${el.duration}s infinite linear`,
                        animationDelay: `-${el.delay}s`,
                    }}
                >
                    <el.Icon size={el.size} strokeWidth={1.5} />
                    <style>
                        {`
              @keyframes float-${el.id} {
                0% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(${30 * el.direction}px, -50px) rotate(${120 * el.direction}deg); }
                66% { transform: translate(${-20 * el.direction}px, 50px) rotate(${240 * el.direction}deg); }
                100% { transform: translate(0, 0) rotate(${360 * el.direction}deg); }
              }
            `}
                    </style>
                </div>
            ))}

            {/* Gradient Overlay to soften edges */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/80 dark:to-[#020617]/80"></div>
        </div>
    );
}
