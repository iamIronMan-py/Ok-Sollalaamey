import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Bouquet } from '../components/illustrations/Bouquet';

type Props = {
  open: number; // 0..1
  auto?: boolean;
};

export const GiftBox3D = forwardRef<HTMLDivElement, Props>(function GiftBox3D({ open }, ref) {
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const t = Math.max(0, Math.min(1, open));
    const lid = root.querySelector('[data-box-lid]') as HTMLElement | null;
    const contents = root.querySelector('[data-box-contents]') as HTMLElement | null;
    const glow = root.querySelector('[data-box-glow]') as HTMLElement | null;
    const aura = root.querySelector('[data-box-aura]') as HTMLElement | null;
    const float = root.querySelector('[data-box-float]') as HTMLElement | null;
    const hideParts = root.querySelectorAll('[data-box-hide]') as NodeListOf<HTMLElement>;
    const boxFade = t <= 0.9 ? 1 : Math.max(0, 1 - (t - 0.9) / 0.1);
    const roseReveal = t <= 0.9 ? 0 : Math.min(1, (t - 0.9) / 0.1);
    const roseEase = 1 - Math.pow(1 - roseReveal, 3);
    if (lid) lid.style.transform = `translateZ(0px) rotateX(${t * -125}deg) translateY(${-t * 2}px)`;
    if (contents) {
      contents.style.opacity = String(roseReveal);
      contents.style.transform = `translateX(-50%) translateY(${18 - roseEase * 40}%) scale(${0.86 + roseEase * 0.18})`;
    }
    if (glow) glow.style.opacity = String((0.2 + t * 0.95) * boxFade);
    if (aura) aura.style.opacity = String(t * boxFade);
    hideParts.forEach((el) => {
      el.style.opacity = String(boxFade);
    });
    if (float) float.style.transform = boxFade < 0.01
      ? 'translateY(-10px) rotateX(0deg) rotateY(180deg)'
      : `translateY(${-4 - t * 6}px) rotateX(${-12 - t * 4}deg) rotateY(${198 + t * 8}deg)`;
  }, [open]);
  return (
    <div className="box3d" data-box aria-hidden="true" ref={rootRef}>
      <div className="box3d__halo" data-box-hide />
      <div className="box3d__scene">
        <div className="box3d__float" data-box-float>
          <div className="box3d__glow" data-box-glow data-box-hide />
          <div className="box3d__cube">
            <div className="box3d__face box3d__face--back" data-box-hide />
            <div className="box3d__face box3d__face--left" data-box-hide />
            <div className="box3d__face box3d__face--right" data-box-hide />
            <div className="box3d__face box3d__face--bottom" data-box-hide />
            <div className="box3d__face box3d__face--front" data-box-hide />

            <div className="box3d__aura" data-box-aura aria-hidden="true">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="box3d__spark"
                  style={{
                    left: `${10 + (i * 37) % 80}%`,
                    top: `${5 + (i * 29) % 70}%`,
                    animationDelay: `${(i % 7) * 0.35}s`,
                    animationDuration: `${2.2 + (i % 5) * 0.5}s`,
                    width: 8 + (i % 4) * 4,
                    height: 8 + (i % 4) * 4,
                  }}
                />
              ))}
            </div>
            <div className="box3d__contents" data-box-contents>
              <div className="box3d__spin">
                <Bouquet className="box3d__bouquet" />
              </div>
            </div>

            <div className="box3d__ribbon box3d__ribbon--v" data-box-hide />
            <div className="box3d__ribbon box3d__ribbon--h" data-box-hide />
            <div className="box3d__tag" aria-hidden="true" data-box-hide><span className="box3d__tag-heart" /></div>

            <div className="box3d__lid-anchor" data-box-hide>
              <div className="box3d__lid" data-box-lid>
                <div className="box3d__lid-face">
                  <div className="box3d__lid-ribbon box3d__lid-ribbon--v" />
                  <div className="box3d__lid-ribbon box3d__lid-ribbon--h" />
                  <div className="box3d__bow" aria-hidden="true">
                    <span className="box3d__bow-loop box3d__bow-loop--l" />
                    <span className="box3d__bow-loop box3d__bow-loop--r" />
                    <span className="box3d__bow-tail box3d__bow-tail--l" />
                    <span className="box3d__bow-tail box3d__bow-tail--r" />
                    <span className="box3d__bow-knot" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="box3d__shadow" data-box-hide />
        </div>
      </div>
    </div>
  );
});
