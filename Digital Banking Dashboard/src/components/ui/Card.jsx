// src/components/ui/Card.jsx
import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={
        "bg-white/80 backdrop-blur-md border border-slate-200 rounded-2xl shadow-sm " +
        className
      }
    >
      {children}
    </div>
  );
};

export default Card;
