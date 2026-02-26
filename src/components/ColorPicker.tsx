"use client";

import { useRef } from "react";
import type { AccentColor } from "@/types";

export const ACCENT_COLORS: AccentColor[] = [
  { name: "Vermelho", value: "#e53e3e" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Verde", value: "#10b981" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Laranja", value: "#f59e0b" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Branco", value: "#ffffff" },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPreset = ACCENT_COLORS.some(
    (c) => c.value.toLowerCase() === value.toLowerCase()
  );
  const isCustom = !isPreset;

  return (
    <div>
      <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-3">
        Cor de destaque
      </label>
      <div className="flex gap-2 flex-wrap items-center">
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.value}
            onClick={() => onChange(color.value)}
            title={color.name}
            aria-label={color.name}
            className="w-9 h-9 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            style={{
              background: color.value,
              border: value === color.value ? "3px solid #fff" : "3px solid #333",
              transform: value === color.value ? "scale(1.18)" : "scale(1)",
              boxShadow: value === color.value ? `0 0 0 1px ${color.value}44` : "none",
            }}
          />
        ))}

        {/* Custom color — rainbow circle that opens the native color picker */}
        <div className="relative w-9 h-9 flex-shrink-0">
          <div
            className="w-9 h-9 rounded-full transition-all duration-200 cursor-pointer"
            onClick={() => inputRef.current?.click()}
            title="Cor personalizada"
            style={{
              background: isCustom
                ? value
                : "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
              border: isCustom ? "3px solid #fff" : "3px solid #333",
              transform: isCustom ? "scale(1.18)" : "scale(1)",
              boxShadow: isCustom ? `0 0 0 1px ${value}44` : "none",
            }}
          />
          <input
            ref={inputRef}
            type="color"
            value={isCustom ? value : "#ff0000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer rounded-full"
            aria-label="Cor personalizada"
          />
        </div>
      </div>
    </div>
  );
}
