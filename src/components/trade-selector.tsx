"use client";

import { TRADES, TRADE_INFO } from "@/lib/constants";

type Props = {
  value: string;
  onChange: (trade: string) => void;
};

export function TradeSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TRADES.map((trade) => {
        const info = TRADE_INFO[trade];
        const selected = value === trade;
        return (
          <button
            type="button"
            key={trade}
            onClick={() => onChange(trade)}
            className={`group relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition ${
              selected
                ? `border-transparent bg-gradient-to-br ${info.gradient} text-white shadow-lg`
                : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:shadow-md"
            }`}
          >
            <span className="text-3xl drop-shadow-sm">{info.icon}</span>
            <span className="text-sm font-semibold">{trade}</span>
            <span className={`text-[11px] leading-tight ${selected ? "text-white/85" : "text-slate-400"}`}>
              {info.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
