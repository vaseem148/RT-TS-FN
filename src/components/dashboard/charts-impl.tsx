'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatDate, titleCase } from '@/lib/utils';

/**
 * Chart series colours. Ordered so adjacent slices stay distinguishable, and
 * defined as CSS variables so both themes stay in sync automatically.
 */
export const SERIES = [
  'var(--brand)',
  'var(--accent)',
  'var(--success)',
  'var(--warning)',
  'var(--info)',
  'var(--danger)',
];

const axisProps = {
  stroke: 'var(--fg-subtle)',
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 shadow-xl">
      {label && <p className="text-[11.5px] font-bold text-fg">{titleCase(String(label))}</p>}
      {payload.map((entry, index) => (
        <p key={index} className="flex items-center gap-1.5 text-[12px] text-fg-muted">
          <span
            className="size-2 rounded-full"
            style={{ background: entry.color }}
            aria-hidden
          />
          {titleCase(entry.name ?? '')}:{' '}
          <span className="font-bold text-fg">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function TrendChart({ data }: { data: { date: string; created: number; resolved: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="createdFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="resolvedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          {...axisProps}
          tickFormatter={(value) => formatDate(value, 'd MMM')}
          minTickGap={24}
        />
        <YAxis {...axisProps} allowDecimals={false} width={34} />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="created"
          stroke="var(--brand)"
          strokeWidth={2}
          fill="url(#createdFill)"
        />
        <Area
          type="monotone"
          dataKey="resolved"
          stroke="var(--success)"
          strokeWidth={2}
          fill="url(#resolvedFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function StatusDonut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius="56%"
          outerRadius="80%"
          paddingAngle={3}
          stroke="var(--surface)"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={SERIES[index % SERIES.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-[11.5px] text-fg-muted">{titleCase(String(value))}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CategoryBars({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
        <XAxis type="number" {...axisProps} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          {...axisProps}
          width={120}
          tickFormatter={(value) => titleCase(String(value))}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={16}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={SERIES[index % SERIES.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
