"use client";
import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & { as?: React.ElementType };

export default function Card({ className = "", children, ...props }: Props) {
  return (
    <div className={`p-2 md:p-4 lg:p-6 glass bg-card/50 ${className}`} {...props}>
      {children}
    </div>
  );
}
