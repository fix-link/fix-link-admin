import { useState } from "react";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface PieDataPoint {
  name: string;
  value: number;
  color: string;
}

// ==========================================
// 1. LINE / AREA CHART (SVG based, premium)
// ==========================================
export const LineChart = ({
  data,
  color = "#3b82f6",
  gradientId = "chart-grad",
  height = 200,
}: {
  data: ChartDataPoint[];
  color?: string;
  gradientId?: string;
  height?: number;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return <div className="text-center py-8 text-subtext-light">No data available</div>;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const padding = 30;
  const chartHeight = height - padding * 2;

  // Calculate points
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * (340 - padding * 2);
    const y = padding + chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${
          height - padding
        } Z`
      : "";

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 340 ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + chartHeight * ratio;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={ratio} className="opacity-20 dark:opacity-10">
              <line
                x1={padding}
                y1={y}
                x2={340 - padding}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text
                x={padding - 5}
                y={y + 4}
                className="text-[9px] font-bold text-right"
                textAnchor="end"
                fill="currentColor"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        {areaD && <path d={areaD} fill={`url(#${gradientId})`} />}

        {/* Line Path */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Interactive Dots */}
        {points.map((p, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            className="cursor-pointer"
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 6 : 4}
              fill={color}
              stroke="white"
              strokeWidth="2"
              className="transition-all duration-150"
            />
            {/* Hover Tooltip (Inside SVG) */}
            {hoveredIndex === i && (
              <g>
                <rect
                  x={p.x - 30}
                  y={p.y - 28}
                  width="60"
                  height="18"
                  rx="4"
                  fill="rgba(15, 23, 42, 0.95)"
                />
                <text
                  x={p.x}
                  y={p.y - 16}
                  fill="white"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.value}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* X Axis Labels */}
        {points.map((p, i) => {
          // Show every label if length < 8, otherwise show alternate
          if (data.length > 8 && i % 2 !== 0) return null;
          return (
            <text
              key={i}
              x={p.x}
              y={height - padding + 15}
              className="text-[8px] font-black text-subtext-light dark:text-subtext-dark opacity-75"
              textAnchor="middle"
              fill="currentColor"
            >
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

// ==========================================
// 2. BAR CHART (SVG based, premium)
// ==========================================
export const BarChart = ({
  data,
  color = "#06b6d4",
  height = 200,
}: {
  data: ChartDataPoint[];
  color?: string;
  height?: number;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return <div className="text-center py-8 text-subtext-light">No data available</div>;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const padding = 30;
  const chartHeight = height - padding * 2;
  const width = 340;
  const barWidth = Math.max(10, (width - padding * 2) / (data.length || 1) - 12);

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + chartHeight * ratio;
          const val = Math.round(maxVal * (1 - ratio));
          return (
            <g key={ratio} className="opacity-20 dark:opacity-10">
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="4"
              />
              <text
                x={padding - 5}
                y={y + 4}
                className="text-[9px] font-bold text-right"
                textAnchor="end"
                fill="currentColor"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x =
            padding +
            (i / data.length) * (width - padding * 2) +
            ((width - padding * 2) / data.length - barWidth) / 2;
          const valHeight = (d.value / maxVal) * chartHeight;
          const y = padding + chartHeight - valHeight;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Actual Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(valHeight, 2)}
                rx="4"
                fill={hoveredIndex === i ? color : `${color}dd`}
                className="transition-all duration-150"
              />

              {/* Bar value label on hover */}
              {hoveredIndex === i && (
                <g>
                  <rect
                    x={x + barWidth / 2 - 20}
                    y={y - 24}
                    width="40"
                    height="16"
                    rx="4"
                    fill="rgba(15, 23, 42, 0.95)"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 13}
                    fill="white"
                    fontSize="8"
                    fontWeight="black"
                    textAnchor="middle"
                  >
                    {d.value}
                  </text>
                </g>
              )}

              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={height - padding + 15}
                className="text-[8px] font-black text-subtext-light dark:text-subtext-dark opacity-75"
                textAnchor="middle"
                fill="currentColor"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ==========================================
// 3. PIE / DONUT CHART (SVG based, premium)
// ==========================================
export const PieChart = ({
  data,
  height = 180,
}: {
  data: PieDataPoint[];
  height?: number;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return <div className="text-center py-8 text-subtext-light">No data available</div>;

  const total = data.reduce((acc, d) => acc + d.value, 0);

  // Donut calculations
  const size = 120;
  const center = size / 2;
  const radius = size / 2.5;
  const strokeWidth = 14;

  let currentAngle = 0;

  const slices = data.map((d, i) => {
    const percentage = total > 0 ? d.value / total : 0;
    const angle = percentage * 360;

    // Convert degrees to polar coordinates
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Points for arc
    const start = polarToCartesian(center, center, radius, startAngle);
    const end = polarToCartesian(center, center, radius, endAngle);
    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
    ].join(" ");

    return {
      pathData,
      color: d.color,
      name: d.name,
      value: d.value,
      percentage: Math.round(percentage * 100),
      index: i,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">
      {/* Donut Ring */}
      <div className="relative size-32 shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
          {slices.map((s, i) => (
            <path
              key={i}
              d={s.pathData}
              fill="none"
              stroke={s.color}
              strokeWidth={hoveredIndex === i ? strokeWidth + 2 : strokeWidth}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ transformOrigin: `${center}px ${center}px` }}
            />
          ))}

          {/* Center Info text */}
          <text
            x={center}
            y={center - 2}
            textAnchor="middle"
            className="text-[10px] font-black text-text-light dark:text-text-dark"
            fill="currentColor"
          >
            {hoveredIndex !== null ? slices[hoveredIndex].name : "Total"}
          </text>
          <text
            x={center}
            y={center + 10}
            textAnchor="middle"
            className="text-[12px] font-black text-gradient"
            fill="currentColor"
          >
            {hoveredIndex !== null
              ? `${slices[hoveredIndex].value} (${slices[hoveredIndex].percentage}%)`
              : total}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 w-full max-w-[200px]">
        {slices.map((s, i) => (
          <div
            key={i}
            className={`flex items-center justify-between text-xs font-medium px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
              hoveredIndex === i ? "bg-slate-100 dark:bg-slate-800" : ""
            }`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-text-light dark:text-text-dark truncate max-w-[100px]">{s.name}</span>
            </div>
            <span className="font-bold text-subtext-light dark:text-subtext-dark">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
