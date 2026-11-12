import roseImg from '../../assets/rose.png';

type BouquetProps = {
  className?: string;
  compact?: boolean;
  bare?: boolean;
};

const SPARKLES = [
  { left: '18%', top: '18%', size: 10, delay: '0s', dur: '2.4s' },
  { left: '32%', top: '10%', size: 7, delay: '0.4s', dur: '3s' },
  { left: '48%', top: '6%', size: 11, delay: '0.9s', dur: '2.6s' },
  { left: '64%', top: '12%', size: 8, delay: '0.2s', dur: '3.2s' },
  { left: '78%', top: '20%', size: 9, delay: '1.1s', dur: '2.8s' },
  { left: '22%', top: '34%', size: 8, delay: '1.4s', dur: '2.7s' },
  { left: '38%', top: '28%', size: 10, delay: '0.6s', dur: '3.1s' },
  { left: '56%', top: '30%', size: 7, delay: '1.7s', dur: '2.5s' },
  { left: '72%', top: '36%', size: 9, delay: '0.8s', dur: '2.9s' },
  { left: '28%', top: '46%', size: 7, delay: '0.3s', dur: '3.3s' },
  { left: '50%', top: '42%', size: 12, delay: '1.3s', dur: '2.6s' },
  { left: '68%', top: '48%', size: 8, delay: '0.5s', dur: '3s' },
];

export function Bouquet({ className = '' }: BouquetProps) {
  return (
    <span className={`bouquet-wrap ${className}`.trim()} aria-hidden="true">
      <img className="bouquet" src={roseImg} alt="" draggable={false} />
      <span className="bouquet__sparkles">
        {SPARKLES.map((s, i) => (
          <span
            key={i}
            className="bouquet__sparkle"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }}
          />
        ))}
      </span>
    </span>
  );
}
