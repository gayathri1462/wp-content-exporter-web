"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

type Option = {
    key: string;
    label: string;
};

type Props = {
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    onOpenChange?: (isOpen: boolean) => void;
    label?: string;
    className?: string;
};

export default function CustomSelect({ value, options, onChange, onOpenChange, label, className = "" }: Props) {
    const [isOpen, _setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const setIsOpen = (newOpenState: boolean) => {
        _setIsOpen(newOpenState);
        if (onOpenChange) {
            onOpenChange(newOpenState);
        }
    };

    const selectedOption = options.find((opt) => opt.key === value);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`w-full space-y-1.5 relative ${className}`} ref={containerRef}>
            {label && <label className="block text-sm font-semibold text-foreground/80 ml-1">{label}</label>}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium transition-all hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-left active:scale-[0.99]"
            >
                <span className="truncate">{selectedOption?.label || "Select an option..."}</span>
                <ChevronDown
                    size={16}
                    className={`text-primary transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="max-h-[300px] overflow-y-auto p-1.5 custom-scrollbar">
                        {options.map((option, idx) => (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => {
                                    onChange(option.key);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-3 py-3 text-sm transition-all rounded-lg mb-1 last:mb-0 text-left animate-in slide-in-from-left-2 duration-300 ease-out hover:bg-primary/10 cursor-pointer`}
                                style={{ animationDelay: `${idx * 40}ms` }}
                            >
                                <span className={`truncate ${value === option.key ? "font-bold text-primary" : "text-foreground font-medium"}`}>{option.label}</span>
                                {value === option.key && <Check size={14} className="text-primary animate-in zoom-in duration-300" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
