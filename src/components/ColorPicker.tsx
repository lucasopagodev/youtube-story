"use client";

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
  return (
    <div>
      <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-3">
        Cor de destaque
      </label>
      <div className="flex gap-2 flex-wrap">
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
      </div>
    </div>
  );
}
