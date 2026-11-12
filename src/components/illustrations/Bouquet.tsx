import roseImg from '../../assets/rose.png';

type BouquetProps = {
  className?: string;
  compact?: boolean;
  bare?: boolean;
};

const SPARKLES = [
  { left: '8%', top: '10%', size: 10, delay: '0s', dur: '2s' },
  { left: '16%', top: '6%', size: 14, delay: '0.3s', dur: '2.6s' },
  { left: '24%', top: '14%', size: 9, delay: '0.7s', dur: '2.2s' },
  { left: '32%', top: '4%', size: 16, delay: '0.1s', dur: '2.8s' },
  { left: '40%', top: '10%', size: 11, delay: '1.1s', dur: '2.4s' },
  { left: '48%', top: '2%', size: 18, delay: '0.5s', dur: '2.1s' },
  { left: '56%', top: '8%', size: 10, delay: '1.4s', dur: '2.7s' },
  { left: '64%', top: '12%', size: 15, delay: '0.2s', dur: '2.3s' },
  { left: '72%', top: '5%', size: 12, delay: '0.9s', dur: '2.9s' },
  { left: '80%', top: '14%', size: 14, delay: '0.6s', dur: '2.5s' },
  { left: '88%', top: '9%', size: 9, delay: '1.2s', dur: '2.2s' },
  { left: '12%', top: '22%', size: 13, delay: '0.4s', dur: '2.6s' },
  { left: '22%', top: '28%', size: 10, delay: '1s', dur: '2.3s' },
  { left: '30%', top: '20%', size: 17, delay: '0.15s', dur: '2.1s' },
  { left: '38%', top: '30%', size: 11, delay: '0.8s', dur: '2.8s' },
  { left: '46%', top: '24%', size: 15, delay: '1.3s', dur: '2.4s' },
  { left: '54%', top: '32%', size: 9, delay: '0.35s', dur: '2.7s' },
  { left: '62%', top: '22%', size: 16, delay: '0.95s', dur: '2.2s' },
  { left: '70%', top: '28%', size: 12, delay: '1.5s', dur: '2.5s' },
  { left: '78%', top: '20%', size: 14, delay: '0.25s', dur: '2.9s' },
  { left: '86%', top: '26%', size: 10, delay: '0.65s', dur: '2.3s' },
  { left: '10%', top: '36%', size: 11, delay: '1.1s', dur: '2.6s' },
  { left: '20%', top: '42%', size: 15, delay: '0.45s', dur: '2.2s' },
  { left: '28%', top: '38%', size: 9, delay: '1.6s', dur: '2.8s' },
  { left: '36%', top: '44%', size: 18, delay: '0.2s', dur: '2.1s' },
  { left: '44%', top: '36%', size: 12, delay: '0.75s', dur: '2.5s' },
  { left: '52%', top: '46%', size: 10, delay: '1.25s', dur: '2.7s' },
  { left: '60%', top: '40%', size: 16, delay: '0.5s', dur: '2.3s' },
  { left: '68%', top: '48%', size: 13, delay: '1.05s', dur: '2.4s' },
  { left: '76%', top: '38%', size: 11, delay: '0.3s', dur: '2.9s' },
  { left: '84%', top: '44%', size: 15, delay: '0.85s', dur: '2.2s' },
  { left: '18%', top: '52%', size: 10, delay: '1.4s', dur: '2.6s' },
  { left: '34%', top: '54%', size: 14, delay: '0.55s', dur: '2.3s' },
  { left: '50%', top: '50%', size: 20, delay: '0.1s', dur: '2s' },
  { left: '66%', top: '54%', size: 12, delay: '0.9s', dur: '2.5s' },
  { left: '82%', top: '52%', size: 13, delay: '0.4s', dur: '2.7s' },
  { left: '26%', top: '16%', size: 19, delay: '1.35s', dur: '2.1s' },
  { left: '58%', top: '18%', size: 17, delay: '0.7s', dur: '2.2s' },
  { left: '42%', top: '34%', size: 18, delay: '1.15s', dur: '2s' },
];

export function Bouquet({ className = '' }: BouquetProps) {
  return (
    <span className={`bouquet-wrap ${className}`.trim()} aria-hidden="true">
      <span className="bouquet__aura" />
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
