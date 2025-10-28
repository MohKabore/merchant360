import { createAnimation, Animation } from '@ionic/angular';

export const slideYFade = (_: HTMLElement, opts?: any): Animation => {
  const D = 220; // durée ms
  const leavingEl = opts?.leavingEl as HTMLElement | undefined;
  const enteringEl = opts?.enteringEl as HTMLElement | undefined;

  const enter = createAnimation()
    .addElement(enteringEl!)
    .duration(D)
    .easing('cubic-bezier(0.2, 0, 0, 1)')
    .fromTo('opacity', '0', '1')
    .fromTo('transform', 'translateY(12px)', 'translateY(0)');

  const leave = leavingEl
    ? createAnimation()
        .addElement(leavingEl)
        .duration(180)
        .easing('cubic-bezier(0.4, 0, 1, 1)')
        .fromTo('opacity', '1', '0')
        .fromTo('transform', 'translateY(0)', 'translateY(-8px)')
    : createAnimation();

  return createAnimation().addAnimation([enter, leave]);
};