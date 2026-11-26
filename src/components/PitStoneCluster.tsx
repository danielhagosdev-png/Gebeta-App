import React from 'react';

type StoneSpec = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rot: number;
  tone: 'pebbleDark' | 'pebbleWarm' | 'cowrie' | 'ochre';
};

// Deterministic spiral-cluster layouts for up to 16 rendered stones inside a 100x100 SVG pit
const STONE_SLOTS: StoneSpec[] = [
  { cx: 50, cy: 50, rx: 10.5, ry: 8.2, rot: -18, tone: 'cowrie' },
  { cx: 35, cy: 40, rx: 9.5, ry: 7.8, rot: 24, tone: 'pebbleWarm' },
  { cx: 64, cy: 41, rx: 9.2, ry: 7.5, rot: -35, tone: 'pebbleDark' },
  { cx: 43, cy: 65, rx: 9.8, ry: 7.8, rot: 12, tone: 'ochre' },
  { cx: 62, cy: 64, rx: 9.4, ry: 7.6, rot: 40, tone: 'cowrie' },
  { cx: 28, cy: 58, rx: 8.8, ry: 7.2, rot: -22, tone: 'pebbleDark' },
  { cx: 51, cy: 29, rx: 8.9, ry: 7.0, rot: 8, tone: 'pebbleWarm' },
  { cx: 73, cy: 53, rx: 8.6, ry: 6.9, rot: 55, tone: 'ochre' },
  { cx: 30, cy: 28, rx: 8.2, ry: 6.6, rot: -14, tone: 'cowrie' },
  { cx: 70, cy: 29, rx: 8.1, ry: 6.5, rot: 31, tone: 'pebbleWarm' },
  { cx: 34, cy: 73, rx: 8.3, ry: 6.6, rot: -42, tone: 'pebbleDark' },
  { cx: 68, cy: 74, rx: 8.0, ry: 6.4, rot: 18, tone: 'pebbleWarm' },
  { cx: 52, cy: 76, rx: 7.9, ry: 6.2, rot: -8, tone: 'cowrie' },
  { cx: 23, cy: 44, rx: 7.6, ry: 6.1, rot: 28, tone: 'ochre' },
  { cx: 76, cy: 40, rx: 7.6, ry: 6.1, rot: -30, tone: 'pebbleDark' },
  { cx: 49, cy: 41, rx: 8.2, ry: 6.8, rot: 15, tone: 'pebbleWarm' },
];

const TONE_FILLS: Record<StoneSpec['tone'], { main: string; hi: string; stroke: string }> = {
  cowrie: { main: '#E7D7BC', hi: '#FAF2E3', stroke: '#8F7A5B' },
  pebbleWarm: { main: '#9E8268', hi: '#C2A88D', stroke: '#4A392B' },
  pebbleDark: { main: '#5E534B', hi: '#85776D', stroke: '#29221D' },
  ochre: { main: '#C48A45', hi: '#E2AF6B', stroke: '#6E481B' },
};

type PitStoneClusterProps = {
  count: number;
  seedOffset?: number;
  isStore?: boolean;
};

export const PitStoneCluster: React.FC<PitStoneClusterProps> = ({
  count,
  seedOffset = 0,
  isStore = false,
}) => {
  if (count <= 0) return null;

  const visibleCount = Math.min(count, isStore ? 16 : 14);
  const items = Array.from({ length: visibleCount }, (_, i) => {
    const slot = STONE_SLOTS[(i + seedOffset * 3) % STONE_SLOTS.length];
    return { ...slot, key: i };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="w-full h-full pointer-events-none select-none"
    >
      {items.map((stone) => {
        const palette = TONE_FILLS[stone.tone];
        return (
          <g
            key={stone.key}
            transform={`translate(${stone.cx}, ${stone.cy}) rotate(${stone.rot})`}
          >
            {/* Soft contact shadow */}
            <ellipse
              cx={1.2}
              cy={2.1}
              rx={stone.rx}
              ry={stone.ry}
              fill="rgba(0,0,0,0.45)"
            />
            {/* Stone body */}
            <ellipse
              cx={0}
              cy={0}
              rx={stone.rx}
              ry={stone.ry}
              fill={palette.main}
              stroke={palette.stroke}
              strokeWidth="1.2"
            />
            {/* Top specular highlight */}
            <ellipse
              cx={-stone.rx * 0.25}
              cy={-stone.ry * 0.28}
              rx={stone.rx * 0.45}
              ry={stone.ry * 0.32}
              fill={palette.hi}
              opacity="0.72"
            />
            {/* Subtle cowrie ridge on ivory stones */}
            {stone.tone === 'cowrie' && (
              <line
                x1={-stone.rx * 0.48}
                y1={0.8}
                x2={stone.rx * 0.48}
                y2={0.8}
                stroke="#856E4E"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
};
