import { useId } from 'react';

type FlowerVariant = 'daisy' | 'rose' | 'tulip' | 'poppy' | 'lavender';

type FlowerProps = {
  x: number;
  y: number;
  stemHeight?: number;
  headScale?: number;
  rotate?: number;
  petal?: string;
  petalLight?: string;
  petalDeep?: string;
  petalHighlight?: string;
  center?: string;
  variant?: FlowerVariant;
  leaves?: boolean;
  className?: string;
  headRotate?: number;
  smiling?: boolean;
  faceColor?: string;
  facing?: 'front' | 'up';
  seed?: number;
};

const LEAF = '#9fc7a9';
const LEAF_LIGHT = '#badbbf';
const STEM = '#7fae92';

export function Flower({
  x,
  y,
  stemHeight = 120,
  headScale = 1,
  rotate = 0,
  petal = '#b3122f',
  petalLight = '#e0405a',
  petalDeep = '#7a0b20',
  petalHighlight = '#ff7a8c',
  center = '#e7c98f',
  variant = 'daisy',
  leaves = true,
  className = '',
  headRotate = 0,
  smiling = false,
  faceColor = '#8a4d5d',
  facing = 'front',
  seed,
}: FlowerProps) {
  const h = stemHeight;
  const sway = h * 0.035;

  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={`flower ${className}`}>
        <path
          className="flower__stem"
          d={`M 0 0 C ${sway} ${-h * 0.34}, ${-sway} ${-h * 0.68}, 0 ${-h}`}
          stroke={STEM}
          strokeWidth={5}
          fill="none"
        />

        {leaves && (
          <g className="flower__leaves">
            <path
              d={`M 0 ${-h * 0.34} C -22 ${-h * 0.4}, -34 ${-h * 0.46}, -42 ${-h * 0.54} C -28 ${-h * 0.46}, -12 ${-h * 0.42}, 0 ${-h * 0.36} Z`}
              fill={LEAF}
            />
            <path
              d={`M 0 ${-h * 0.34} C -20 ${-h * 0.38}, -30 ${-h * 0.42}, -40 ${-h * 0.5}`}
              stroke={LEAF_LIGHT}
              strokeWidth={1.6}
              fill="none"
              opacity={0.8}
            />
            <path
              d={`M 1 ${-h * 0.52} C 22 ${-h * 0.58}, 34 ${-h * 0.64}, 42 ${-h * 0.72} C 28 ${-h * 0.64}, 12 ${-h * 0.6}, 1 ${-h * 0.54} Z`}
              fill={LEAF}
            />
            <path
              d={`M 1 ${-h * 0.52} C 20 ${-h * 0.56}, 30 ${-h * 0.6}, 40 ${-h * 0.68}`}
              stroke={LEAF_LIGHT}
              strokeWidth={1.6}
              fill="none"
              opacity={0.8}
            />
          </g>
        )}

        <g transform={`translate(0 ${-h}) rotate(${rotate}) scale(${headScale})`}>
          <g className={`flower__head${smiling ? ' flower__head--smiling' : ''}`} transform={`rotate(${headRotate})${facing === 'up' ? ' scale(0.82 1.45)' : ''}`}>
            <circle
              r={variant === 'rose' ? 27 : variant === 'lavender' ? 15 : 23}
              fill={petal}
              opacity={variant === 'lavender' ? 0.08 : facing === 'up' ? 0.1 : 0.16}
            />
            {variant === 'daisy' && <Daisy petal={petal} petalLight={petalLight} center={center} />}
            {variant === 'poppy' && <Poppy petal={petal} petalLight={petalLight} center={center} />}
            {variant === 'rose' && (
              <Rose
                petal={petal}
                petalLight={petalLight}
                petalDeep={petalDeep}
                petalHighlight={petalHighlight}
                center={center}
                seed={seed}
              />
            )}
            {variant === 'tulip' && <Tulip petal={petal} petalLight={petalLight} center={center} />}
            {variant === 'lavender' && (
              <Lavender petal={petal} petalLight={petalLight} petalHighlight={petalHighlight} center={center} />
            )}
            {smiling && facing !== 'up' && (
              <g className="flower__face" opacity={0.9}>
                <circle cx={-3.2} cy={-1.4} r={1.25} fill={faceColor} />
                <circle cx={3.2} cy={-1.4} r={1.25} fill={faceColor} />
                <path d="M -3.6 2.1 Q 0 5 3.6 2.1" stroke={faceColor} strokeWidth={1.4} fill="none" strokeLinecap="round" />
                <circle cx={-5.2} cy={1.2} r={1.6} fill="#f2a9bc" opacity={0.35} />
                <circle cx={5.2} cy={1.2} r={1.6} fill="#f2a9bc" opacity={0.35} />
              </g>
            )}
          </g>
        </g>
      </g>
    </g>
  );
}

function Daisy({
  petal,
  petalLight,
  center,
}: {
  petal: string;
  petalLight: string;
  center: string;
}) {
  return (
    <g>
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse
          key={i}
          className="flower__petal"
          cx={0}
          cy={-15}
          rx={7.5}
          ry={17}
          fill={i % 2 === 0 ? petal : petalLight}
          transform={`rotate(${i * 45})`}
        />
      ))}
      <circle r={8.5} fill={center} />
      <circle r={4.2} fill="#f6e3b9" />
      {Array.from({ length: 5 }).map((_, i) => {
        const a = (i / 5) * Math.PI * 2;
        return <circle key={i} cx={Math.cos(a) * 4} cy={Math.sin(a) * 4} r={0.9} fill="#c9a45e" />;
      })}
    </g>
  );
}

function Poppy({
  petal,
  petalLight,
  center,
}: {
  petal: string;
  petalLight: string;
  center: string;
}) {
  return (
    <g>
      {Array.from({ length: 5 }).map((_, i) => (
        <ellipse
          key={i}
          className="flower__petal"
          cx={0}
          cy={-16}
          rx={13}
          ry={19}
          fill={i % 2 === 0 ? petal : petalLight}
          transform={`rotate(${i * 72})`}
        />
      ))}
      <circle r={7} fill={center} />
      <circle r={3.2} fill="#a98a4f" opacity={0.8} />
    </g>
  );
}

function Rose({
  petal,
  petalLight,
  petalDeep,
  petalHighlight,
  center,
  seed = 0,
}: {
  petal: string;
  petalLight: string;
  petalDeep: string;
  petalHighlight: string;
  center: string;
  seed?: number;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const rnd = (i: number) => {
    const x = Math.sin(seed * 999 + i * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };

  const gradOuter = `ro-${uid}`;
  const gradMid = `rm-${uid}`;
  const gradInner = `ri-${uid}`;
  const gradCenter = `rc-${uid}`;
  const shadow = `rs-${uid}`;
  const gloss = `rg-${uid}`;

  const petalShape = (w: number, h: number, curl: number, wobble: number, notch: number) => {
    const tipY = -h;
    const c1 = -w * (0.92 + wobble * 0.12);
    const c2 = -w * (0.78 - wobble * 0.08);
    const c3 = -w * (0.38 + wobble * 0.1);
    const n = notch * h * 0.08;
    return `M 0 ${-h * 0.08}
      C ${c3} ${-h * 0.14}, ${c2} ${-h * 0.52}, ${c1 * 0.72 + curl} ${tipY * 0.86}
      C ${c1 * 0.42} ${tipY * 1.02 + n}, ${-w * 0.12} ${tipY * 1.04 - n}, ${curl * 0.6} ${tipY}
      C ${w * 0.12} ${tipY * 1.04 + n * 0.6}, ${c1 * -0.42} ${tipY * 1.02 - n}, ${-c1 * 0.72 - curl} ${tipY * 0.86}
      C ${-c2} ${-h * 0.52}, ${-c3} ${-h * 0.14}, 0 ${-h * 0.08} Z`;
  };

  const layers = [
    { count: 5, w: 17.5, h: 30, r: 8.5, offset: 6, grad: gradOuter, deep: true },
    { count: 6, w: 16, h: 27, r: 10, offset: 28, grad: gradOuter, deep: true },
    { count: 7, w: 14, h: 23, r: 10.5, offset: 54, grad: gradMid, deep: false },
    { count: 6, w: 12, h: 19, r: 10, offset: 78, grad: gradMid, deep: false },
    { count: 5, w: 10, h: 15, r: 9, offset: 102, grad: gradInner, deep: false },
    { count: 5, w: 8, h: 11.5, r: 7.5, offset: 132, grad: gradInner, deep: false },
    { count: 4, w: 6.2, h: 8.5, r: 5.5, offset: 164, grad: gradInner, deep: false },
  ];

  const droplets = [0, 1, 2].filter((i) => rnd(50 + i) > 0.38).slice(0, 2);

  return (
    <g>
      <defs>
        <radialGradient id={gradOuter} cx="35%" cy="28%" r="78%">
          <stop offset="0%" stopColor={petalHighlight} stopOpacity="0.95" />
          <stop offset="28%" stopColor={petalLight} />
          <stop offset="62%" stopColor={petal} />
          <stop offset="100%" stopColor={petalDeep} />
        </radialGradient>
        <radialGradient id={gradMid} cx="38%" cy="24%" r="74%">
          <stop offset="0%" stopColor={petalHighlight} stopOpacity="0.9" />
          <stop offset="32%" stopColor={petalLight} />
          <stop offset="70%" stopColor={petal} />
          <stop offset="100%" stopColor={petalDeep} stopOpacity="0.95" />
        </radialGradient>
        <radialGradient id={gradInner} cx="42%" cy="20%" r="70%">
          <stop offset="0%" stopColor={petalHighlight} />
          <stop offset="38%" stopColor={petalLight} />
          <stop offset="78%" stopColor={petal} />
          <stop offset="100%" stopColor={petalDeep} stopOpacity="0.9" />
        </radialGradient>
        <radialGradient id={gradCenter} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={petalLight} />
          <stop offset="55%" stopColor={petal} />
          <stop offset="100%" stopColor={petalDeep} />
        </radialGradient>
        <filter id={shadow} x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" floodColor={petalDeep} floodOpacity="0.35" />
        </filter>
        <filter id={gloss} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      <ellipse rx="22" ry="18" cy="4" fill={petalDeep} opacity="0.18" />

      {layers.map((layer, li) => (
        <g key={li} filter={li < 4 ? `url(#${shadow})` : undefined}>
          {Array.from({ length: layer.count }).map((_, i) => {
            const v = rnd(li * 20 + i);
            const v2 = rnd(li * 20 + i + 7);
            const v3 = rnd(li * 20 + i + 13);
            const a = layer.offset + (i * 360) / layer.count + (v - 0.5) * 10;
            const w = layer.w * (0.9 + v * 0.22);
            const h = layer.h * (0.92 + v2 * 0.18);
            const curl = (v - 0.5) * 2.6;
            const rr = layer.r + (v3 - 0.5) * 1.6;
            const wobble = v2;
            const notch = v3;
            const rotX = -6 - li * 2 + (v - 0.5) * 6;
            return (
              <g key={i} transform={`rotate(${a}) translate(0 ${-rr}) rotate(${rotX})`}>
                <path d={petalShape(w, h, curl, wobble, notch)} fill={`url(#${layer.grad})`} />
                <path
                  d={petalShape(w * 0.82, h * 0.86, curl * 0.7, wobble, notch)}
                  fill={petalDeep}
                  opacity={0.08 + li * 0.015}
                />
                <path
                  d={`M ${-w * 0.18} ${-h * 0.28} C ${-w * 0.05} ${-h * 0.55}, ${w * 0.02} ${-h * 0.78}, ${curl * 0.2} ${-h * 0.92}`}
                  stroke={petalDeep}
                  strokeWidth={0.5}
                  fill="none"
                  opacity={0.18}
                  strokeLinecap="round"
                />
                <path
                  d={`M ${w * 0.12} ${-h * 0.32} C ${w * 0.18} ${-h * 0.52}, ${w * 0.08} ${-h * 0.72}, ${curl * 0.15} ${-h * 0.88}`}
                  stroke={petalHighlight}
                  strokeWidth={0.45}
                  fill="none"
                  opacity={0.12}
                  strokeLinecap="round"
                />
                {li < 3 && (
                  <ellipse
                    cx={-w * 0.18 + v * 2}
                    cy={-h * 0.46}
                    rx={w * 0.22}
                    ry={h * 0.16}
                    fill="#fff6f8"
                    opacity={0.16 + v2 * 0.1}
                    filter={`url(#${gloss})`}
                  />
                )}
                {li < 2 && v > 0.55 && (
                  <path
                    d={petalShape(w * 0.55, h * 0.22, curl * 0.4, wobble, 0.5)}
                    fill={petalLight}
                    opacity={0.22}
                    transform={`translate(0 ${-h * 0.72}) rotate(${(v - 0.5) * 18})`}
                  />
                )}
              </g>
            );
          })}
        </g>
      ))}

      <g>
        <ellipse rx="6.8" ry="5.6" fill={`url(#${gradCenter})`} />
        <path d="M -4.8 1.6 C -6.2 -1.8 -3.4 -5.2 0.2 -5.4 C 3.6 -5.2 5.4 -2.2 4.2 1.2 C 2.8 4.2 -1.4 4.8 -4.8 1.6 Z" fill={petalDeep} opacity="0.55" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = -40 + i * 62 + rnd(80 + i) * 18;
          const rr = 1.2 + i * 0.55;
          return (
            <path
              key={i}
              d={`M ${Math.cos((a * Math.PI) / 180) * rr} ${Math.sin((a * Math.PI) / 180) * rr}
                  C ${Math.cos(((a + 40) * Math.PI) / 180) * (rr + 1.6)} ${Math.sin(((a + 40) * Math.PI) / 180) * (rr + 1.6)},
                    ${Math.cos(((a + 95) * Math.PI) / 180) * (rr + 2.6)} ${Math.sin(((a + 95) * Math.PI) / 180) * (rr + 2.6)},
                    ${Math.cos(((a + 140) * Math.PI) / 180) * (rr + 1.2)} ${Math.sin(((a + 140) * Math.PI) / 180) * (rr + 1.2)}`}
              stroke={i % 2 ? petalDeep : petal}
              strokeWidth={1.1 - i * 0.08}
              fill="none"
              strokeLinecap="round"
              opacity={0.85 - i * 0.06}
            />
          );
        })}
        <circle r="1.4" fill={center} opacity="0.75" />
      </g>

      {droplets.map((d, i) => {
        const a = rnd(60 + d) * Math.PI * 2;
        const dist = 10 + rnd(63 + d) * 10;
        const x = Math.cos(a) * dist;
        const y = -Math.sin(a) * dist - 6;
        const s = 0.9 + rnd(66 + d) * 0.7;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <ellipse rx="1.5" ry="2.1" fill="#eef9ff" opacity="0.55" />
            <ellipse rx="1.2" ry="1.7" fill="#ffffff" opacity="0.35" />
            <circle cx="-0.4" cy="-0.7" r="0.45" fill="#ffffff" opacity="0.9" />
          </g>
        );
      })}

      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = rnd(90 + i) * Math.PI * 2;
        const dist = 3 + rnd(96 + i) * 11;
        const gx = Math.cos(a) * dist * 0.75;
        const gy = -10 - rnd(102 + i) * 13;
        const gs = 0.45 + rnd(108 + i) * 0.9;
        const op = 0.4 + rnd(114 + i) * 0.55;
        return (
          <g key={`g${i}`} transform={`translate(${gx} ${gy}) scale(${gs})`} opacity={op}>
            <circle r="1.0" fill="#fffdf6" />
            <path d="M 0 -2.1 L 0 2.1 M -2.1 0 L 2.1 0" stroke="#fff4c8" strokeWidth="0.55" strokeLinecap="round" />
            <path d="M -1.3 -1.3 L 1.3 1.3 M 1.3 -1.3 L -1.3 1.3" stroke="#ffe9a8" strokeWidth="0.4" strokeLinecap="round" opacity="0.85" />
          </g>
        );
      })}
    </g>
  );
}

function Lavender({
  petal,
  petalLight,
  petalHighlight,
  center,
}: {
  petal: string;
  petalLight: string;
  petalHighlight: string;
  center: string;
}) {
  const florets = Array.from({ length: 18 }, (_, i) => {
    const t = i / 17;
    return {
      x: Math.sin(t * Math.PI * 2.1) * 7 * (1 - t * 0.3),
      y: -7 - t * 63,
      r: 4.6 - t * 1.7,
      fill: i % 3 === 0 ? petalLight : i % 3 === 1 ? petal : petalHighlight,
    };
  });
  return (
    <g>
      <path d="M 0 3 C -3 -18 3 -43 0 -73" stroke="#7fae92" strokeWidth={2.6} fill="none" />
      {florets.map((floret, i) => (
        <circle
          key={i}
          className="flower__petal"
          cx={floret.x}
          cy={floret.y}
          r={floret.r}
          fill={floret.fill}
          opacity={0.96}
        />
      ))}
      {florets
        .filter((_, i) => i % 2 === 0)
        .map((floret, i) => (
          <circle
            key={`highlight-${i}`}
            cx={floret.x - 0.9}
            cy={floret.y - 1}
            r={floret.r * 0.34}
            fill="#f3e6ff"
            opacity={0.72}
          />
        ))}
      <circle cy={-77} r={2.8} fill={petalLight} />
      <circle cy={-83} r={1.7} fill={center} opacity={0.9} />
    </g>
  );
}

function Tulip({
  petal,
  petalLight,
  center,
}: {
  petal: string;
  petalLight: string;
  center: string;
}) {
  return (
    <g>
      <path
        className="flower__petal"
        d="M 0 2 C -16 -4 -20 -28 -9 -40 C -3 -47 0 -36 0 -28 C 0 -36 3 -47 9 -40 C 20 -28 16 -4 0 2 Z"
        fill={petal}
      />
      <path
        className="flower__petal"
        d="M 0 2 C -12 -6 -14 -26 -5 -38 C 0 -45 0 -30 0 -20 Z"
        fill={petalLight}
        opacity={0.9}
      />
      <path
        d="M 0 -2 L 0 -26"
        stroke={center}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.55}
      />
      <circle cy={-1} r={5} fill={center} opacity={0.9} />
    </g>
  );
}
