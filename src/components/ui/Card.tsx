"use client";
import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & { as?: React.ElementType };

export default function Card({ className = "", children, ...props }: Props) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow ${className}`} {...props}>
      {children}
    </div>
  );
}
