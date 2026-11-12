import roseImg from '../../assets/rose.png';

type BouquetProps = {
  className?: string;
  compact?: boolean;
  bare?: boolean;
};

export function Bouquet({ className = '' }: BouquetProps) {
  return <img className={`bouquet ${className}`.trim()} src={roseImg} alt="" draggable={false} />;
}
