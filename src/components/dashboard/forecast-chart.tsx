"use client";

import { useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, CartesianGrid } from "recharts";
import { getForecastSeries } from "@/services/forecast.service";
import { cn } from "@/lib/utils";

const items = ["Chicken Breast", "Cooking Oil", "Tomatoes", "Paneer", "Basmati Rice"];

export function ForecastChart() {
  const [selectedItem, setSelectedItem] = useState(items[0]);
  const series = getForecastSeries(selectedItem);

  const formatXAxis = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
  };

  return (
    <div className="card-base bg-surface p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary tracking-tight">Demand & Inventory Outlook</h3>
          <p className="text-[13px] text-text-secondary mt-1">Branch: <span className="font-medium text-text-primary">Hyderabad Central</span></p>
        </div>

        <div className="flex items-center bg-background rounded-md p-1 border border-border overflow-x-auto">
          {items.map((item) => (
            <button
              key={item}
              onClick={() => setSelectedItem(item)}
              className={cn(
                "px-3 py-1.5 text-[12px] font-medium rounded transition-colors whitespace-nowrap",
                selectedItem === item
                  ? "bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6 px-4 py-3 bg-surface-elevated rounded-lg border border-border">
        <div className="flex flex-col">
          <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Forecast Confidence</span>
          <span className="text-[14px] font-medium text-success">92%</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col">
          <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Projected Stockout</span>
          <span className="text-[14px] font-medium text-critical">46 hours</span>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex flex-col">
          <span className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">Demand Trend</span>
          <span className="text-[14px] font-medium text-warning">+38% weekend uplift</span>
        </div>
      </div>

      <div className="h-[280px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tickFormatter={formatXAxis}
              stroke="var(--color-text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="var(--color-text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}kg`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border-strong)",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(23, 32, 29, 0.05)",
                color: "var(--color-text-primary)",
              }}
              labelFormatter={(label) => new Date(label as string).toLocaleDateString()}
            />
            
            <ReferenceLine y={8} stroke="var(--color-critical)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Safety Stock (8kg)', fill: 'var(--color-critical)', fontSize: 11 }} />

            <Area
              type="monotone"
              dataKey="actual"
              stroke="var(--color-success)"
              strokeWidth={2}
              fill="transparent"
              name="Actual Demand"
            />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="var(--color-accent)"
              strokeWidth={2}
              fill="url(#predictedGrad)"
              name="Predicted Demand"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <h4 className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">Contributing Factors</h4>
        <div className="flex flex-wrap gap-2">
          {["Weekend surge", "Recent consumption trend", "Festival season approaching"].map((factor, i) => (
            <span key={i} className="px-3 py-1 bg-background border border-border text-[12px] text-text-secondary rounded-md">
              {factor}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
