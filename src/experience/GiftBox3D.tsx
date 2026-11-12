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
    const float = root.querySelector('[data-box-float]') as HTMLElement | null;
    if (lid) lid.style.transform = `translateZ(0px) rotateX(${t * -125}deg) translateY(${-t * 2}px)`;
    if (contents) {
      contents.style.opacity = String(t);
      contents.style.transform = `translateX(-50%) translateY(${4 - t * 26}%) scale(${0.9 + t * 0.14})`;
    }
    if (glow) glow.style.opacity = String(0.15 + t * 0.85);
    if (float) float.style.transform = `translateY(${-4 - t * 6}px) rotateX(${-12 - t * 4}deg) rotateY(${18 + t * 8}deg)`;
  }, [open]);
  return (
    <div className="box3d" data-box aria-hidden="true" ref={rootRef}>
      <div className="box3d__halo" />
      <div className="box3d__scene">
        <div className="box3d__float" data-box-float>
          <div className="box3d__glow" data-box-glow />
          <div className="box3d__cube">
            <div className="box3d__face box3d__face--back" />
            <div className="box3d__face box3d__face--left" />
            <div className="box3d__face box3d__face--right" />
            <div className="box3d__face box3d__face--bottom" />
            <div className="box3d__face box3d__face--front" />

            <div className="box3d__contents" data-box-contents>
              <div className="box3d__spin">
                <Bouquet className="box3d__bouquet" />
              </div>
            </div>

            <div className="box3d__ribbon box3d__ribbon--v" />
            <div className="box3d__ribbon box3d__ribbon--h" />
            <div className="box3d__tag" aria-hidden="true"><span className="box3d__tag-heart" /></div>

            <div className="box3d__lid-anchor">
              <div className="box3d__lid" data-box-lid>
                <div className="box3d__lid-face" />
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
          <div className="box3d__shadow" />
        </div>
      </div>
    </div>
  );
});
