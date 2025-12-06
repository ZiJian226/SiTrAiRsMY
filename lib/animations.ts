import anime from 'animejs/lib/anime.es.js';

export const fadeInUp = (targets: string | HTMLElement | NodeListOf<HTMLElement>, delay = 0) => {
  return anime({
    targets,
    translateY: [50, 0],
    opacity: [0, 1],
    duration: 800,
    delay,
    easing: 'easeOutExpo',
  });
};

export const fadeIn = (targets: string | HTMLElement | NodeListOf<HTMLElement>, delay = 0) => {
  return anime({
    targets,
    opacity: [0, 1],
    duration: 1000,
    delay,
    easing: 'easeOutQuad',
  });
};

export const scaleIn = (targets: string | HTMLElement | NodeListOf<HTMLElement>, delay = 0) => {
  return anime({
    targets,
    scale: [0.8, 1],
    opacity: [0, 1],
    duration: 600,
    delay,
    easing: 'easeOutBack',
  });
};

export const slideInLeft = (targets: string | HTMLElement | NodeListOf<HTMLElement>, delay = 0) => {
  return anime({
    targets,
    translateX: [-100, 0],
    opacity: [0, 1],
    duration: 800,
    delay,
    easing: 'easeOutExpo',
  });
};

export const slideInRight = (targets: string | HTMLElement | NodeListOf<HTMLElement>, delay = 0) => {
  return anime({
    targets,
    translateX: [100, 0],
    opacity: [0, 1],
    duration: 800,
    delay,
    easing: 'easeOutExpo',
  });
};

export const staggerFadeInUp = (targets: string | HTMLElement | NodeListOf<HTMLElement>) => {
  return anime({
    targets,
    translateY: [50, 0],
    opacity: [0, 1],
    duration: 800,
    delay: anime.stagger(100),
    easing: 'easeOutExpo',
  });
};

export const pulseAnimation = (targets: string | HTMLElement | NodeListOf<HTMLElement>) => {
  return anime({
    targets,
    scale: [1, 1.05, 1],
    duration: 2000,
    loop: true,
    easing: 'easeInOutQuad',
  });
};

export const floatAnimation = (targets: string | HTMLElement | NodeListOf<HTMLElement>) => {
  return anime({
    targets,
    translateY: [-10, 10],
    duration: 3000,
    loop: true,
    direction: 'alternate',
    easing: 'easeInOutSine',
  });
};

export const rotateIn = (targets: string | HTMLElement | NodeListOf<HTMLElement>, delay = 0) => {
  return anime({
    targets,
    rotate: [180, 0],
    opacity: [0, 1],
    duration: 1000,
    delay,
    easing: 'easeOutExpo',
  });
};

export const cardHoverAnimation = (target: HTMLElement) => {
  anime({
    targets: target,
    translateY: -10,
    duration: 300,
    easing: 'easeOutCubic',
  });
};

export const cardHoverReset = (target: HTMLElement) => {
  anime({
    targets: target,
    translateY: 0,
    duration: 300,
    easing: 'easeOutCubic',
  });
};
