import React, { useEffect, useRef, useState } from 'react';
import { FlightCanvas, FlightHandle } from './FlightCanvas';
import { Envelope } from '../components/illustrations/Envelope';
import { GiftParcel } from '../components/illustrations/GiftParcel';
import { Garden } from '../components/illustrations/Garden';
import { Puppy } from '../components/illustrations/Puppy';
import { Bouquet } from '../components/illustrations/Bouquet';
import { Flower } from '../components/illustrations/Flower';
import { GiftBox3D } from './GiftBox3D';
import { storyAudio } from './audio';
import { GIFT } from '../config';
import './experience.css';
const CHAPTERS = [
  { at: 0, name: 'A little surprise' },
  { at: 11, name: 'Wrapped in Dubai' },
  { at: 23, name: 'The journey' },
  { at: 57, name: 'A garden in bloom' },
  { at: 69, name: 'Arrived in Paris' },
  { at: 81, name: 'The ribbon' },
  { at: 93, name: 'Delivered with love' },
];
const PETALS = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37.7 + 4) % 100,
  size: 7 + (i % 5) * 3.4,
  drift: ((i * 53) % 150) - 75,
  rotate: (i * 47) % 360,
  color: ['#b3122f', '#8b6bd1', '#e0405a', '#a58ae0', '#c9184a'][i % 5],
}));
const DOOR_HEARTS = Array.from({ length: 48 }, (_, i) => ({
  left: (i * 21.13 + 3) % 100,
  bottom: (i * 17.7) % 88,
  size: 10 + (i % 6) * 5,
  delay: (i % 12) * 0.45,
  dur: 4.2 + (i % 5) * 1.3,
  drift: ((i * 37) % 120) - 60,
  color: ['#ff6f91', '#ff9fb0', '#ffb3c1', '#f089a6', '#e0405a', '#ffc2d4'][i % 6],
  opacity: 0.45 + (i % 5) * 0.12,
}));
const FINALE_SPARKS = Array.from({ length: 90 }, (_, i) => ({
  left: (i * 11.17 + 1) % 100,
  top: (i * 13.73 + 2) % 100,
  size: i % 4 === 0 ? 14 + (i % 4) * 4 : i % 4 === 1 ? 10 + (i % 3) * 3 : 5 + (i % 4) * 2,
  kind: i % 4 === 0 ? 'star' : 'heart',
  delay: (i % 14) * 0.4,
  dur: 3.6 + (i % 7) * 0.8,
  drift: ((i * 29) % 160) - 80,
  color: i % 4 === 0 ? ['#fff6d6', '#ffe8a3', '#fffdf2', '#f7e7b0', '#ffffff'][i % 5] : ['#ff6f91', '#ff9fb0', '#e0405a', '#ffb3c1', '#c9b6f2', '#ffd1e1'][i % 6],
  opacity: 0.5 + (i % 5) * 0.1,
}));
const BLOOM_FLIGHT = [
  { left: 3, top: 6, size: 'far', color: 'rgba(255,255,255,0.95)', delay: 0.2, dur: 2.8, points: 5 },
  { left: 8, top: 18, size: 'mid', color: 'rgba(255,214,232,0.95)', delay: 1.1, dur: 3.4, points: 4 },
  { left: 13, top: 11, size: 'far', color: 'rgba(216,204,255,0.92)', delay: 0.6, dur: 2.6, points: 5 },
  { left: 18, top: 24, size: 'mid', color: 'rgba(255,255,255,0.9)', delay: 1.8, dur: 3.8, points: 4 },
  { left: 23, top: 8, size: 'far', color: 'rgba(255,214,232,0.92)', delay: 0.4, dur: 3.1, points: 5 },
  { left: 28, top: 20, size: 'mid', color: 'rgba(216,204,255,0.94)', delay: 2.2, dur: 2.9, points: 4 },
  { left: 33, top: 4, size: 'far', color: 'rgba(255,255,255,0.95)', delay: 1.4, dur: 3.6, points: 5 },
  { left: 38, top: 15, size: 'mid', color: 'rgba(255,214,232,0.94)', delay: 0.9, dur: 2.7, points: 4 },
  { left: 43, top: 27, size: 'far', color: 'rgba(216,204,255,0.9)', delay: 2.6, dur: 3.5, points: 5 },
  { left: 48, top: 9, size: 'mid', color: 'rgba(255,255,255,0.92)', delay: 0.1, dur: 3.2, points: 4 },
  { left: 53, top: 19, size: 'far', color: 'rgba(255,214,232,0.92)', delay: 1.6, dur: 2.8, points: 5 },
  { left: 58, top: 5, size: 'mid', color: 'rgba(216,204,255,0.94)', delay: 2.0, dur: 3.7, points: 4 },
  { left: 63, top: 22, size: 'far', color: 'rgba(255,255,255,0.9)', delay: 0.7, dur: 3.0, points: 5 },
  { left: 68, top: 13, size: 'mid', color: 'rgba(255,214,232,0.95)', delay: 1.3, dur: 2.9, points: 4 },
  { left: 73, top: 26, size: 'far', color: 'rgba(216,204,255,0.92)', delay: 2.4, dur: 3.4, points: 5 },
  { left: 78, top: 7, size: 'mid', color: 'rgba(255,255,255,0.94)', delay: 0.3, dur: 2.6, points: 4 },
  { left: 83, top: 17, size: 'far', color: 'rgba(255,214,232,0.92)', delay: 1.9, dur: 3.3, points: 5 },
  { left: 88, top: 23, size: 'mid', color: 'rgba(216,204,255,0.94)', delay: 0.8, dur: 2.8, points: 4 },
  { left: 93, top: 10, size: 'far', color: 'rgba(255,255,255,0.9)', delay: 2.1, dur: 3.6, points: 5 },
  { left: 96, top: 21, size: 'mid', color: 'rgba(255,214,232,0.93)', delay: 1.0, dur: 3.0, points: 4 },
  { left: 11, top: 3, size: 'far', color: 'rgba(216,204,255,0.9)', delay: 1.7, dur: 2.7, points: 5 },
  { left: 36, top: 29, size: 'far', color: 'rgba(255,255,255,0.88)', delay: 2.8, dur: 3.9, points: 4 },
  { left: 61, top: 2, size: 'far', color: 'rgba(255,214,232,0.9)', delay: 0.5, dur: 3.1, points: 5 },
  { left: 76, top: 28, size: 'far', color: 'rgba(216,204,255,0.88)', delay: 1.5, dur: 2.9, points: 4 },
] as const;
const BURST_BOUQUETS = [
  { left: 31, top: 50, width: 24, rotate: -24, x: -18, y: 8 },
  { left: 69, top: 42, width: 22, rotate: 18, x: 20, y: -8 },
  { left: 54, top: 79, width: 20, rotate: 8, x: -10, y: 18 },
  { left: 82, top: 75, width: 18, rotate: -12, x: 16, y: 14 },
] as const;
const FINALE_FLOWERS = [
  { left: 1, bottom: 0, scale: 0.52, stem: 112, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: -12, phase: 0 },
  { left: 4, bottom: 6, scale: 0.46, stem: 104, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: -10, phase: 0.2 },
  { left: 7, bottom: 1, scale: 0.6, stem: 128, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: -8, phase: 0.4 },
  { left: 10, bottom: 8, scale: 0.5, stem: 110, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -6, phase: 0.6 },
  { left: 13, bottom: 2, scale: 0.66, stem: 138, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: -5, phase: 0.8 },
  { left: 16, bottom: 10, scale: 0.48, stem: 106, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: -4, phase: 1.0 },
  { left: 19, bottom: 0, scale: 0.58, stem: 124, petal: '#8b6bd1', light: '#a58ae0', deep: '#5c3fa8', hi: '#c9b6f2', center: '#fff1c9', rot: -3, phase: 1.2 },
  { left: 22, bottom: 7, scale: 0.54, stem: 118, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -2, phase: 1.4 },
  { left: 25, bottom: 2, scale: 0.7, stem: 146, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -1, phase: 1.6 },
  { left: 28, bottom: 11, scale: 0.46, stem: 102, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 0, phase: 1.8 },
  { left: 31, bottom: 4, scale: 0.62, stem: 132, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 1, phase: 2.0 },
  { left: 34, bottom: 9, scale: 0.5, stem: 110, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 1, phase: 2.2 },
  { left: 37, bottom: 1, scale: 0.68, stem: 142, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: 2, phase: 2.4 },
  { left: 40, bottom: 12, scale: 0.44, stem: 100, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 2, phase: 2.6 },
  { left: 43, bottom: 5, scale: 0.6, stem: 128, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 0, phase: 2.8 },
  { left: 46, bottom: 10, scale: 0.52, stem: 114, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 0, phase: 3.0 },
  { left: 49, bottom: 0, scale: 0.72, stem: 150, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 0, phase: 3.2 },
  { left: 52, bottom: 8, scale: 0.56, stem: 120, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 0, phase: 3.4 },
  { left: 55, bottom: 3, scale: 0.64, stem: 136, petal: '#8b6bd1', light: '#a58ae0', deep: '#5c3fa8', hi: '#c9b6f2', center: '#fff1c9', rot: -1, phase: 3.6 },
  { left: 58, bottom: 11, scale: 0.48, stem: 106, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -1, phase: 3.8 },
  { left: 61, bottom: 1, scale: 0.68, stem: 142, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -2, phase: 4.0 },
  { left: 64, bottom: 9, scale: 0.5, stem: 110, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: -2, phase: 4.2 },
  { left: 67, bottom: 4, scale: 0.62, stem: 132, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: -1, phase: 4.4 },
  { left: 70, bottom: 12, scale: 0.46, stem: 102, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 0, phase: 4.6 },
  { left: 73, bottom: 0, scale: 0.58, stem: 124, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: 1, phase: 4.8 },
  { left: 76, bottom: 7, scale: 0.54, stem: 118, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 2, phase: 5.0 },
  { left: 79, bottom: 2, scale: 0.7, stem: 146, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 3, phase: 5.2 },
  { left: 82, bottom: 10, scale: 0.48, stem: 106, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 4, phase: 5.4 },
  { left: 85, bottom: 1, scale: 0.6, stem: 128, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 5, phase: 5.6 },
  { left: 88, bottom: 8, scale: 0.5, stem: 110, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 6, phase: 5.8 },
  { left: 91, bottom: 3, scale: 0.66, stem: 138, petal: '#8b6bd1', light: '#a58ae0', deep: '#5c3fa8', hi: '#c9b6f2', center: '#fff1c9', rot: 8, phase: 6.0 },
  { left: 94, bottom: 9, scale: 0.46, stem: 104, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 10, phase: 6.2 },
  { left: 97, bottom: 0, scale: 0.54, stem: 116, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 12, phase: 6.4 },
  { left: 6, bottom: 14, scale: 0.42, stem: 96, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: -9, phase: 6.6 },
  { left: 18, bottom: 15, scale: 0.4, stem: 94, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: -6, phase: 6.8 },
  { left: 30, bottom: 14, scale: 0.44, stem: 98, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: -3, phase: 7.0 },
  { left: 42, bottom: 16, scale: 0.4, stem: 92, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 0, phase: 7.2 },
  { left: 54, bottom: 15, scale: 0.42, stem: 96, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 0, phase: 7.4 },
  { left: 66, bottom: 16, scale: 0.4, stem: 92, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 3, phase: 7.6 },
  { left: 78, bottom: 14, scale: 0.44, stem: 98, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 6, phase: 7.8 },
  { left: 90, bottom: 15, scale: 0.4, stem: 94, petal: '#8b6bd1', light: '#a58ae0', deep: '#5c3fa8', hi: '#c9b6f2', center: '#fff1c9', rot: 9, phase: 8.0 },
  { left: 2, bottom: 18, scale: 0.38, stem: 90, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -8, phase: 8.2 },
  { left: 9, bottom: 20, scale: 0.36, stem: 86, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: -6, phase: 8.4 },
  { left: 16, bottom: 17, scale: 0.4, stem: 92, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: -5, phase: 8.6 },
  { left: 23, bottom: 21, scale: 0.36, stem: 86, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: -4, phase: 8.8 },
  { left: 30, bottom: 18, scale: 0.42, stem: 94, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: -3, phase: 9.0 },
  { left: 37, bottom: 22, scale: 0.34, stem: 84, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -2, phase: 9.2 },
  { left: 44, bottom: 19, scale: 0.4, stem: 92, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 0, phase: 9.4 },
  { left: 51, bottom: 23, scale: 0.34, stem: 84, petal: '#8b6bd1', light: '#a58ae0', deep: '#5c3fa8', hi: '#c9b6f2', center: '#fff1c9', rot: 0, phase: 9.6 },
  { left: 58, bottom: 18, scale: 0.42, stem: 94, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 2, phase: 9.8 },
  { left: 65, bottom: 21, scale: 0.36, stem: 86, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 3, phase: 10.0 },
  { left: 72, bottom: 17, scale: 0.4, stem: 92, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 4, phase: 10.2 },
  { left: 79, bottom: 20, scale: 0.36, stem: 86, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 5, phase: 10.4 },
  { left: 86, bottom: 18, scale: 0.38, stem: 90, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 6, phase: 10.6 },
  { left: 93, bottom: 21, scale: 0.34, stem: 84, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: 8, phase: 10.8 },
  { left: 0, bottom: 12, scale: 0.44, stem: 98, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: -11, phase: 11.0 },
  { left: 98, bottom: 12, scale: 0.44, stem: 98, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 11, phase: 11.2 },
  { left: 5, bottom: 24, scale: 0.32, stem: 80, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: -7, phase: 11.4 },
  { left: 12, bottom: 26, scale: 0.3, stem: 78, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -5, phase: 11.6 },
  { left: 20, bottom: 24, scale: 0.34, stem: 84, petal: '#8b6bd1', light: '#a58ae0', deep: '#5c3fa8', hi: '#c9b6f2', center: '#fff1c9', rot: -4, phase: 11.8 },
  { left: 28, bottom: 25, scale: 0.32, stem: 80, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -2, phase: 12.0 },
  { left: 36, bottom: 27, scale: 0.3, stem: 78, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: -1, phase: 12.2 },
  { left: 46, bottom: 26, scale: 0.34, stem: 84, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 0, phase: 12.4 },
  { left: 54, bottom: 27, scale: 0.3, stem: 78, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 1, phase: 12.6 },
  { left: 62, bottom: 25, scale: 0.32, stem: 80, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 2, phase: 12.8 },
  { left: 70, bottom: 24, scale: 0.34, stem: 84, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: 4, phase: 13.0 },
  { left: 78, bottom: 26, scale: 0.3, stem: 78, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 5, phase: 13.2 },
  { left: 86, bottom: 24, scale: 0.32, stem: 80, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 7, phase: 13.4 },
  { left: 95, bottom: 25, scale: 0.3, stem: 78, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 9, phase: 13.6 },
  { left: 3, bottom: 30, scale: 0.34, stem: 84, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: -10, phase: 14.0 },
  { left: 10, bottom: 32, scale: 0.32, stem: 80, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: -8, phase: 14.2 },
  { left: 17, bottom: 29, scale: 0.36, stem: 86, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: -6, phase: 14.4 },
  { left: 24, bottom: 33, scale: 0.3, stem: 78, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -4, phase: 14.6 },
  { left: 31, bottom: 30, scale: 0.34, stem: 84, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: -2, phase: 14.8 },
  { left: 38, bottom: 34, scale: 0.32, stem: 80, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 0, phase: 15.0 },
  { left: 45, bottom: 31, scale: 0.36, stem: 86, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 0, phase: 15.2 },
  { left: 52, bottom: 33, scale: 0.3, stem: 78, petal: '#8b6bd1', light: '#a58ae0', deep: '#5c3fa8', hi: '#c9b6f2', center: '#fff1c9', rot: 2, phase: 15.4 },
  { left: 59, bottom: 30, scale: 0.34, stem: 84, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 4, phase: 15.6 },
  { left: 66, bottom: 34, scale: 0.32, stem: 80, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 6, phase: 15.8 },
  { left: 73, bottom: 31, scale: 0.36, stem: 86, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 8, phase: 16.0 },
  { left: 80, bottom: 33, scale: 0.3, stem: 78, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 10, phase: 16.2 },
  { left: 87, bottom: 30, scale: 0.34, stem: 84, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 12, phase: 16.4 },
  { left: 94, bottom: 32, scale: 0.32, stem: 80, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: 14, phase: 16.6 },
  { left: 1, bottom: 36, scale: 0.3, stem: 78, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -12, phase: 16.8 },
  { left: 8, bottom: 38, scale: 0.28, stem: 74, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: -10, phase: 17.0 },
  { left: 15, bottom: 35, scale: 0.32, stem: 80, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: -8, phase: 17.2 },
  { left: 22, bottom: 39, scale: 0.28, stem: 74, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: -6, phase: 17.4 },
  { left: 29, bottom: 36, scale: 0.3, stem: 78, petal: '#8b6bd1', light: '#a58ae0', deep: '#5c3fa8', hi: '#c9b6f2', center: '#fff1c9', rot: -4, phase: 17.6 },
  { left: 36, bottom: 38, scale: 0.32, stem: 80, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -2, phase: 17.8 },
  { left: 43, bottom: 35, scale: 0.28, stem: 74, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 0, phase: 18.0 },
  { left: 50, bottom: 39, scale: 0.3, stem: 78, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 0, phase: 18.2 },
  { left: 57, bottom: 36, scale: 0.32, stem: 80, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 2, phase: 18.4 },
  { left: 64, bottom: 38, scale: 0.28, stem: 74, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 4, phase: 18.6 },
  { left: 71, bottom: 35, scale: 0.3, stem: 78, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: 6, phase: 18.8 },
  { left: 78, bottom: 39, scale: 0.32, stem: 80, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 8, phase: 19.0 },
  { left: 85, bottom: 36, scale: 0.28, stem: 74, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 10, phase: 19.2 },
  { left: 92, bottom: 38, scale: 0.3, stem: 78, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 12, phase: 19.4 },
  { left: 99, bottom: 35, scale: 0.28, stem: 74, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 14, phase: 19.6 },
  { left: 0, bottom: 42, scale: 0.26, stem: 70, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: -14, phase: 20.0 },
  { left: 6, bottom: 44, scale: 0.24, stem: 68, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: -10, phase: 20.2 },
  { left: 12, bottom: 41, scale: 0.28, stem: 72, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -8, phase: 20.4 },
  { left: 18, bottom: 45, scale: 0.24, stem: 68, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: -6, phase: 20.6 },
  { left: 24, bottom: 42, scale: 0.26, stem: 70, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: -4, phase: 20.8 },
  { left: 30, bottom: 44, scale: 0.28, stem: 72, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -2, phase: 21.0 },
  { left: 36, bottom: 41, scale: 0.24, stem: 68, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 0, phase: 21.2 },
  { left: 42, bottom: 45, scale: 0.26, stem: 70, petal: '#8b6bd1', light: '#a58ae0', deep: '#5c3fa8', hi: '#c9b6f2', center: '#fff1c9', rot: 0, phase: 21.4 },
  { left: 48, bottom: 42, scale: 0.28, stem: 72, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 2, phase: 21.6 },
  { left: 54, bottom: 44, scale: 0.24, stem: 68, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 4, phase: 21.8 },
  { left: 60, bottom: 41, scale: 0.26, stem: 70, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 6, phase: 22.0 },
  { left: 66, bottom: 45, scale: 0.28, stem: 72, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 8, phase: 22.2 },
  { left: 72, bottom: 42, scale: 0.24, stem: 68, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 10, phase: 22.4 },
  { left: 78, bottom: 44, scale: 0.26, stem: 70, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: 12, phase: 22.6 },
  { left: 84, bottom: 41, scale: 0.28, stem: 72, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 14, phase: 22.8 },
  { left: 90, bottom: 45, scale: 0.24, stem: 68, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 16, phase: 23.0 },
  { left: 96, bottom: 42, scale: 0.26, stem: 70, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 18, phase: 23.2 },
  { left: 3, bottom: 48, scale: 0.22, stem: 64, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: -12, phase: 23.4 },
  { left: 15, bottom: 50, scale: 0.2, stem: 62, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: -8, phase: 23.6 },
  { left: 27, bottom: 47, scale: 0.24, stem: 66, petal: '#8b6bd1', light: '#a58ae0', deep: '#5c3fa8', hi: '#c9b6f2', center: '#fff1c9', rot: -4, phase: 23.8 },
  { left: 39, bottom: 49, scale: 0.22, stem: 64, petal: '#e0405a', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 0, phase: 24.0 },
  { left: 51, bottom: 48, scale: 0.2, stem: 62, petal: '#c9184a', light: '#f06d8a', deep: '#7a0b20', hi: '#ff9fb0', center: '#e7c98f', rot: 0, phase: 24.2 },
  { left: 63, bottom: 50, scale: 0.24, stem: 66, petal: '#a58ae0', light: '#c9b6f2', deep: '#6d4ec4', hi: '#e7ddfb', center: '#fff1c9', rot: 4, phase: 24.4 },
  { left: 75, bottom: 47, scale: 0.22, stem: 64, petal: '#d62839', light: '#ff7a8c', deep: '#7a0b20', hi: '#ffd0d6', center: '#e7c98f', rot: 8, phase: 24.6 },
  { left: 87, bottom: 49, scale: 0.2, stem: 62, petal: '#b3122f', light: '#e0405a', deep: '#7a0b20', hi: '#ff7a8c', center: '#e7c98f', rot: 12, phase: 24.8 },
  { left: 99, bottom: 48, scale: 0.22, stem: 64, petal: '#8b6bd1', light: '#c9b6f2', deep: '#5c3fa8', hi: '#e7ddfb', center: '#fff1c9', rot: 14, phase: 25.0 },
] as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a || 1));
  return x * x * (3 - 2 * x);
};

export function Experience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const flightRef = useRef<FlightHandle>(null);
  const chapterNumRef = useRef<HTMLSpanElement>(null);
  const chapterNameRef = useRef<HTMLSpanElement>(null);
  const distanceRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const flightBarRef = useRef<HTMLSpanElement>(null);
  const progressFillRef = useRef<HTMLSpanElement>(null);
  const cutsceneRef = useRef<HTMLDivElement>(null);
  const celebrationRef = useRef<HTMLDivElement>(null);
  const touchHeartsRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const boxOpenRef = useRef(0);
  const unboxDwellRef = useRef(0);
  const finaleUiRef = useRef<'none' | 'celebrate' | 'restart'>('none');
  const [boxOpen, setBoxOpen] = useState(0);
  const [finaleUi, setFinaleUi] = useState<'none' | 'celebrate' | 'restart'>('none');

  const handleStagePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    storyAudio.unlock();
    if (progressRef.current < 0.93) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-finale-controls]')) return;
    const layer = touchHeartsRef.current;
    if (!layer) return;
    const rect = layer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hearts = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < hearts; i += 1) {
      const h = document.createElement('span');
      h.className = 'touch-heart';
      const size = 14 + Math.random() * 18;
      h.style.left = `${x + (Math.random() - 0.5) * 24}px`;
      h.style.top = `${y + (Math.random() - 0.5) * 24}px`;
      h.style.width = `${size}px`;
      h.style.height = `${size}px`;
      h.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
      h.style.setProperty('--dy', `${-40 - Math.random() * 120}px`);
      h.style.animationDuration = `${1.4 + Math.random() * 1.1}s`;
      h.style.background = ['#ff6f91', '#ff9fb0', '#ffb3c1', '#e0405a', '#ffc2d4'][i % 5];
      layer.appendChild(h);
      window.setTimeout(() => h.remove(), 2600);
    }
  };

  const triggerFinaleCelebration = (e: React.MouseEvent) => {
    e.stopPropagation();
    storyAudio.unlock();
    if (finaleUiRef.current !== 'celebrate') return;
    (window as any).__spawnPartyBlast?.();
    finaleUiRef.current = 'restart';
    setFinaleUi('restart');
  };

  const restartExperience = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.reload();
  };



  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    const q = (sel: string) => Array.from(root.querySelectorAll(sel)) as HTMLElement[];
    const setStyles = (sel: string, styles: Partial<CSSStyleDeclaration>) => {
      q(sel).forEach((el) => Object.assign(el.style, styles));
    };
    const setOpacity = (sel: string, v: number) => setStyles(sel, { opacity: String(clamp01(v)) });
    const setTransform = (sel: string, transform: string, opacity?: number) => {
      const s: any = { transform };
      if (opacity !== undefined) s.opacity = String(clamp01(opacity));
      setStyles(sel, s);
    };

    let raf = 0;
    let last = performance.now();
    let boostUntil = 0;
    let userScrollUntil = 0;
    let cutscene: { scene: 'door'; t0: number; dur: number; onDone?: () => void } | null = null;
    let doorAutoDone = false;
    let bloomBarkDone = false;
    let takeoffSoundStarted = false;
    let landingCueDone = false;
    let syncedScrollTop = 0;
    progressRef.current = 0;
    boxOpenRef.current = 0;
    unboxDwellRef.current = 0;

    const maxScroll = () => Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const syncScrollFromProgress = (p: number) => {
      syncedScrollTop = p * maxScroll();
      window.scrollTo({ top: syncedScrollTop });
    };

    const onScroll = () => {
      if (cutscene || root.classList.contains('is-cinema')) return;
      if (Math.abs(window.scrollY - syncedScrollTop) < 1.5) return;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      if (max < 10) return;
      const next = clamp01(window.scrollY / max);
      if (next < 0.02 && progressRef.current > 0.08) return;
      progressRef.current = next;
      userScrollUntil = performance.now() + 1800;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const unlockAudio = () => storyAudio.unlock();
    window.addEventListener('pointerdown', unlockAudio, { passive: true });
    window.addEventListener('wheel', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('scroll', unlockAudio, { passive: true });
    storyAudio.unlock();
    const autoplayRetry = window.setInterval(() => storyAudio.unlock(), 1200);
    const autoplayStop = window.setTimeout(() => window.clearInterval(autoplayRetry), 45000);

    const spawnCelebration = () => {
      const layer = celebrationRef.current;
      if (!layer) return;
      layer.replaceChildren();
      const colors = ['#b3122f', '#8b6bd1', '#e0405a', '#a58ae0', '#c9184a', '#c9b6f2', '#f3d7a2', '#ff9fb0', '#ff6f91', '#ffb3c1'];
      const burst = (count: number, delayBase: number, power = 1) => {
        for (let i = 0; i < count; i += 1) {
          const piece = document.createElement('span');
          const r = Math.random();
          const isFlower = r < 0.55;
          const isPetal = !isFlower && r < 0.78;
          const isStar = !isFlower && !isPetal && r < 0.9;
          const size = isFlower ? 14 + Math.random() * 18 : isPetal ? 10 + Math.random() * 12 : 6 + Math.random() * 10;
          piece.className = isFlower ? 'confetti confetti--flower' : isPetal ? 'confetti confetti--petal' : isStar ? 'confetti confetti--star' : 'confetti';
          piece.style.left = `${Math.random() * 100}%`;
          piece.style.width = `${size}px`;
          piece.style.height = isFlower ? `${size * 1.25}px` : isPetal ? `${size * 1.3}px` : `${size * (0.5 + Math.random() * 0.7)}px`;
          piece.style.background = colors[i % colors.length];
          piece.style.animationDelay = `${delayBase + Math.random() * 0.8}s`;
          piece.style.animationDuration = `${3.6 + Math.random() * 3.2}s`;
          piece.style.setProperty('--drift', `${(Math.random() - 0.5) * (420 * power)}px`);
          piece.style.setProperty('--spin', `${Math.random() * 1440 - 720}deg`);
          layer.appendChild(piece);
        }
      };
      burst(180, 0, 1.1);
      window.setTimeout(() => burst(140, 0.35, 1.2), 350);
      window.setTimeout(() => burst(160, 0.75, 1.25), 900);
      window.setTimeout(() => burst(120, 1.15, 1.1), 1500);
      window.setTimeout(() => burst(100, 1.6, 1), 2200);
      window.setTimeout(() => layer.replaceChildren(), 12000);
    };
    (window as any).__spawnPartyBlast = spawnCelebration;

    const startDoor = (onDone?: () => void) => {
      if (cutscene) return;
      storyAudio.unlock();
      cutscene = { scene: 'door', t0: performance.now(), dur: 8200, onDone };
      const node = cutsceneRef.current;
      if (node) {
        node.dataset.scene = 'door';
        node.dataset.active = 'true';
        const pup = node.querySelector('.doorway__puppy') as HTMLElement | null;
        if (pup) { pup.style.animation = 'none'; void pup.offsetHeight; pup.style.animation = ''; }
      }
      root.classList.add('is-cinema');
      document.documentElement.classList.add('is-cinema');
      window.setTimeout(() => storyAudio.play('bark'), 700);
      window.setTimeout(() => storyAudio.play('bark'), 3000);
    };

    const update = (p: number, dt: number, now: number) => {
      p = clamp01(p);
      (window as any).__lastP = p;
      (window as any).__ticks = ((window as any).__ticks || 0) + 1;
      progressRef.current = p;
      const pct = p * 100;

      let chapter = 0;
      CHAPTERS.forEach((c, i) => { if (pct >= c.at) chapter = i; });
      root.dataset.chapter = String(chapter);
      if (chapterNumRef.current) chapterNumRef.current.textContent = String(chapter + 1).padStart(2, '0');
      if (chapterNameRef.current) chapterNameRef.current.textContent = CHAPTERS[chapter].name;
      if (progressFillRef.current) progressFillRef.current.style.transform = `scaleX(${p})`;

      const hud = root.querySelector('.hud') as HTMLElement | null;
      if (hud) {
        const light = (pct >= 21 && pct < 56) || (pct >= 79 && pct < 93);
        hud.style.color = light ? '#fff8f2' : '#2b2028';
      }

      const introOut = smooth(0.08, 0.12, p);
      setOpacity('[data-sky="dawn"]', 1 - smooth(0.21, 0.25, p));
      setOpacity('[data-sky="flight"]', smooth(0.21, 0.24, p) * (1 - smooth(0.545, 0.575, p)));
      setOpacity('[data-sky="garden"]', smooth(0.548, 0.58, p) * (1 - smooth(0.674, 0.704, p)));
      setOpacity('[data-sky="paris"]', smooth(0.677, 0.71, p) * (1 - smooth(0.796, 0.826, p)));
      setOpacity('[data-sky="studio"]', smooth(0.799, 0.84, p) * (1 - smooth(0.924, 0.954, p)));
      setOpacity('[data-sky="finale"]', smooth(0.927, 0.97, p));
      setOpacity('[data-scroll-hint]', 1 - smooth(0.014, 0.04, p));

      q('.chapter--intro [data-copy]').forEach((el, i) => {
        const o = 1 - introOut;
        el.style.opacity = String(clamp01(o));
        el.style.transform = `translateY(${-42 * introOut - i * 2 * introOut}px)`;
      });
      setTransform('[data-envelope]', `translateY(${-54 * smooth(0,0.09,p) - 170 * introOut}px) rotate(${-2 * smooth(0,0.09,p) - 9 * introOut}deg) scale(${1 + 0.03 * smooth(0,0.09,p) + 0.08 * introOut})`, 1 - introOut);

      const dubaiIn = smooth(0.095, 0.13, p);
      const dubaiOut = smooth(0.206, 0.224, p);
      q('.chapter--dubai [data-copy]').forEach((el, i) => {
        const y = (1 - dubaiIn) * 40 - dubaiOut * 30;
        el.style.opacity = String(clamp01(dubaiIn * (1 - dubaiOut)));
        el.style.transform = `translateY(${y + i * 2}px)`;
      });
      const parcelDrop = smooth(0.094, 0.148, p);
      const parcelOut = smooth(0.206, 0.224, p);
      setTransform('[data-parcel]', `translateY(${-260 * (1 - parcelDrop) + 90 * parcelOut}px) rotate(${-11 * (1 - parcelDrop) + 7 * parcelOut}deg) scale(${0.82 + 0.18 * parcelDrop - 0.1 * parcelOut})`, parcelDrop * (1 - parcelOut));

      const takeU = clamp01((p - 0.155) / 0.11);
      const flightLayer = root.querySelector('[data-flight]') as HTMLElement | null;
      if (flightLayer) flightLayer.style.opacity = String(p >= 0.15 && p < 0.78 ? 1 : 0);
      if (p >= 0.155 && p < 0.265) {
        if (!takeoffSoundStarted && takeU > 0.28) { storyAudio.play('takeoff'); takeoffSoundStarted = true; }
        flightRef.current?.setTakeoff(takeU);
      } else if (p >= 0.265 && p < 0.76) {
        if (takeoffSoundStarted) { storyAudio.stopTakeoff(); takeoffSoundStarted = false; }
        const ft = clamp01((p - 0.265) / 0.455);
        flightRef.current?.setProgress(ft);
        if (ft > 0.92) storyAudio.stopCruise();
        else storyAudio.startCruise();
        if (!landingCueDone && ft >= 0.84) { storyAudio.play('landing'); landingCueDone = true; }
        if (ft < 0.72) landingCueDone = false;
        if (distanceRef.current) distanceRef.current.textContent = `${Math.round(ft * 6700).toLocaleString('en-US')} km`;
        let st = 'Cruising over the Atlantic';
        if (ft < 0.2) st = 'Lifting off from Dubai';
        else if (ft >= 0.84) st = 'Touchdown, Paris';
        else if (ft > 0.72) st = 'Descending into Paris';
        if (statusRef.current) statusRef.current.textContent = st;
        if (flightBarRef.current) flightBarRef.current.style.transform = `scaleX(${ft})`;
      } else {
        storyAudio.stopCruise();
        if (p < 0.155) { takeoffSoundStarted = false; flightRef.current?.setTakeoff(0); }
      }
      setOpacity('[data-flight-hud]', smooth(0.24, 0.27, p) * (1 - smooth(0.735, 0.765, p)));
      q('.chapter--journey [data-copy]').forEach((el) => { el.style.opacity = String(smooth(0.23,0.26,p)*(1-smooth(0.284,0.3,p))); el.style.transform = `translateY(${(1-smooth(0.23,0.26,p))*40}px)`; });

      const bloomIn = smooth(0.566, 0.60, p);
      const bloomOut = smooth(0.659, 0.68, p);
      setTransform('[data-garden]', `translateY(${50 * (1 - bloomIn) + 48 * bloomOut}px) scale(${0.94 + 0.06 * bloomIn + 0.04 * bloomOut})`, bloomIn * (1 - bloomOut));
      if (bloomIn > 0.5 && !bloomBarkDone) { bloomBarkDone = true; }
      q('[data-bloom-item]').forEach((el, i) => { const bi = smooth(0.558 + i*0.004, 0.60 + i*0.004, p) * (1 - smooth(0.662,0.68,p)); el.style.opacity = String(clamp01(bi)); el.style.transform = `scale(${0.5 + 0.5*bi})`; });
      q('.chapter--bloom [data-copy]').forEach((el)=>{ const o=smooth(0.566,0.59,p)*(1-smooth(0.659,0.675,p)); el.style.opacity=String(clamp01(o)); el.style.transform=`translateY(${(1-smooth(0.566,0.59,p))*40}px)`; });

      const arrIn = smooth(0.686, 0.71, p);
      const arrOut = smooth(0.782, 0.8, p);
      setTransform('[data-arrival]', `translateY(${52 * arrOut}px) scale(${1 - 0.03 * arrOut})`, arrIn * (1 - arrOut));
      setTransform('[data-arrival-parcel]', `translateY(${-300 * (1 - arrIn)}px) scale(${0.84 + 0.16 * arrIn})`, arrIn);
      q('.chapter--arrival [data-copy]').forEach((el)=>{ const o=smooth(0.686,0.71,p)*(1-smooth(0.782,0.8,p)); el.style.opacity=String(clamp01(o)); el.style.transform=`translateY(${(1-smooth(0.686,0.71,p))*40}px)`; });

      if (!cutscene && !doorAutoDone && p >= 0.755) {
        doorAutoDone = true;
        startDoor(() => { progressRef.current = Math.max(progressRef.current, 0.795); syncScrollFromProgress(progressRef.current); });
      }

      const boxIn = smooth(0.806, 0.84, p);
      const boxOut = smooth(0.922, 0.95, p);
      setTransform('[data-box-stage]', `translateY(${90 * (1 - boxIn) - 60 * boxOut}px) scale(${0.82 + 0.18 * boxIn})`, boxIn * (1 - boxOut));
      q('.chapter--unbox [data-copy]').forEach((el)=>{ const o=smooth(0.808,0.84,p)*(1-smooth(0.886,0.91,p)); el.style.opacity=String(clamp01(o)); el.style.transform=`translateY(${(1-smooth(0.808,0.84,p))*40}px)`; });

      if (p >= 0.84 && p < 0.93) {
        unboxDwellRef.current += dt;
        if (unboxDwellRef.current > 1.0 || now < boostUntil) {
          boxOpenRef.current = Math.min(1, boxOpenRef.current + dt * 0.18);
        }
      } else if (p < 0.84) {
        unboxDwellRef.current = 0;
        boxOpenRef.current = Math.max(0, Math.min(boxOpenRef.current, smooth(0.806, 0.84, p) * 0.1));
      } else if (p >= 0.93) {
        boxOpenRef.current = 1;
      }
      if (Math.abs(boxOpenRef.current - boxOpen) > 0.01) setBoxOpen(boxOpenRef.current);

      if (p >= 0.955 && finaleUiRef.current === 'none') {
        finaleUiRef.current = 'celebrate';
        setFinaleUi('celebrate');
      }

      q('.chapter--finale [data-copy]').forEach((el,i)=>{ const o=smooth(0.929+i*0.004,0.96+i*0.004,p); el.style.opacity=String(clamp01(o)); el.style.transform=`translateY(${(1-o)*40}px)`; });
      const friendsIn = smooth(0.936, 0.968, p);
      setTransform('[data-finale-friends]', `translateY(${44 * (1 - friendsIn)}px) scale(${0.9 + 0.1 * friendsIn})`, friendsIn);
      setOpacity('[data-petals]', smooth(0.932, 0.96, p));
      setOpacity('[data-finale-flowers]', smooth(0.93, 0.965, p));
      setOpacity('[data-finale-sparks]', smooth(0.928, 0.958, p));
      const controlsIn = smooth(0.952, 0.97, p);
      setOpacity('[data-finale-controls]', controlsIn);
      q('[data-finale-flower]').forEach((el, i) => {
        const fin = smooth(0.928 + i * 0.002, 0.958 + i * 0.002, p);
        const phase = (el as HTMLElement).dataset.phase ? Number((el as HTMLElement).dataset.phase) : i * 0.45;
        const sway = Math.sin(now / 900 + phase) * 5.5;
        const headTurn = Math.sin(now / 1100 + phase) * 9 + (50 - Number((el as HTMLElement).dataset.left || 50)) * 0.12;
        (el as HTMLElement).style.opacity = String(clamp01(fin));
        (el as HTMLElement).style.transform = `translateY(${(1 - fin) * 56}px) rotate(${sway}deg) scale(${0.88 + fin * 0.12})`;
        const head = (el as HTMLElement).querySelector('.flower__head') as SVGGElement | null;
        if (head) head.setAttribute('transform', `rotate(${headTurn.toFixed(2)})`);
      });
    };

    update(progressRef.current, 0, performance.now());
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (cutscene) {
        if (now - cutscene.t0 >= cutscene.dur) {
          const done = cutscene.onDone;
          cutscene = null;
          const node = cutsceneRef.current;
          if (node) node.dataset.active = 'false';
          root.classList.remove('is-cinema');
          document.documentElement.classList.remove('is-cinema');
          storyAudio.stopLanding();
          if (done) done();
        }
      } else {
        const boosted = now < boostUntil;
        const userScrolling = now < userScrollUntil;
        let speed = boosted ? 0.05 : 0.007;
        if (userScrolling && !boosted) speed = 0.0015;
        if (progressRef.current >= 0.155 && progressRef.current < 0.76) speed = Math.max(speed, 0.012);
        if (progressRef.current >= 0.84 && progressRef.current < 0.9 && boxOpenRef.current < 0.98) speed = Math.min(speed, 0.001);
        if (progressRef.current < 1) {
          progressRef.current = Math.min(1, progressRef.current + speed * dt);
          if (!userScrolling || boosted || (progressRef.current >= 0.155 && progressRef.current < 0.76)) syncScrollFromProgress(progressRef.current);
        }
      }
      update(progressRef.current, dt, now);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(autoplayRetry);
      window.clearTimeout(autoplayStop);
      storyAudio.stopCruise();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('wheel', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('scroll', unlockAudio);
    };
  }, []);

  return (
    <div className="exp" ref={rootRef}>
      <div className="exp__stage" onPointerDown={handleStagePointer}>
        <div className="backdrop" aria-hidden="true">
          <div className="sky sky--dawn is-on" data-sky="dawn" />
          <div className="sky sky--flight" data-sky="flight" />
          <div className="sky sky--garden" data-sky="garden" />
          <div className="sky sky--paris" data-sky="paris" />
          <div className="sky sky--studio" data-sky="studio" />
          <div className="sky sky--finale" data-sky="finale" />
          <div className="backdrop__aura" /><div className="backdrop__vignette" /><div className="backdrop__grain" />
        </div>
        <div className="flight" data-flight>
          <FlightCanvas ref={flightRef} />
        </div>
        <div className="objects" aria-hidden="true">
          <div className="object object--envelope"><div className="object__inner" data-envelope><Envelope /></div></div>
          <div className="object object--parcel"><div className="object__inner" data-parcel><GiftParcel /></div></div>
          <div className="object object--garden"><div className="object__inner" data-garden><Garden puppyParcel /></div></div>
          <div className="bloom-flight" data-bloom-flight aria-hidden="true">
            {BLOOM_FLIGHT.map((item, index) => (
              <div key={index} className={`bloom-flight__item bloom-flight__item--${item.size}`} data-bloom-item style={{ left: `${item.left}%`, top: `${item.top}%` }}>
                <span
                  className="bloom-flight__star"
                  aria-hidden="true"
                  style={{ background: item.color, color: item.color, animationDelay: `${item.delay}s`, animationDuration: `${item.dur}s` }}
                />
              </div>
            ))}
          </div>
          <div className="object object--arrival">
            <div className="object__inner arrival-scene" data-arrival>
              <div className="arrival-scene__glow" />
              <div className="arrival-scene__parcel" data-arrival-parcel><GiftParcel /></div>
              <div className="delivery-card" data-arrival-card><div className="delivery-card__top"><span>Express</span><span>Handle with love</span></div><div className="delivery-card__code">DXB ? ORY</div><div className="delivery-card__line" /><p className="delivery-card__note">For you, with all my love.</p></div>
              <div className="delivery-stamp" data-arrival-stamp>Delivered<br />with love<br />Paris</div>
            </div>
          </div>
          <div className="object object--box">
            <div className="object__inner" data-box-stage><GiftBox3D open={boxOpen} /></div>
            <div className="bouquet-burst" data-bouquet-burst aria-hidden="true">
              {BURST_BOUQUETS.map((item, index) => (<div key={index} className="bouquet-burst__item" data-burst-item style={{ left: `${item.left}%`, top: `${item.top}%`, width: `${item.width}%` }} />))}
            </div>
          </div>
          <div className="object object--finale-friends">
            <div className="object__inner finale-friends" data-finale-friends>
              <Bouquet className="finale-friends__bouquet" />
              <div className="finale-friends__puppy"><Puppy crown withRose /></div>
            </div>
          </div>
          <div className="finale-flowers" data-finale-flowers aria-hidden="true" style={{ opacity: 0 }}>
            {FINALE_FLOWERS.map((f, i) => (
              <div key={i} className="finale-flowers__item" data-finale-flower data-phase={f.phase} data-left={f.left} style={{ left: `${f.left}%`, bottom: `${f.bottom}%`, width: `${f.scale * 120}px`, opacity: 0 }}>
                <svg viewBox="0 0 80 180" className="finale-flowers__svg">
                  <Flower x={40} y={176} stemHeight={f.stem} headScale={0.9} rotate={f.rot} petal={f.petal} petalLight={f.light} petalDeep={f.deep} petalHighlight={f.hi} center={f.center} variant="rose" smiling />
                </svg>
              </div>
            ))}
          </div>
        </div>
        <div className="petals" data-petals aria-hidden="true">
          {PETALS.map((petal, i) => (<span key={i} style={{ left: `${petal.left}%`, width: petal.size, height: petal.size * 0.72, background: petal.color }} />))}
        </div>
        <div className="finale-sparks" data-finale-sparks aria-hidden="true" style={{ opacity: 0 }}>
          {FINALE_SPARKS.map((s, i) => (
            <span
              key={i}
              className={`finale-sparks__item finale-sparks__item--${s.kind}`}
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, color: s.color, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`, ['--drift' as any]: `${s.drift}px`, opacity: s.opacity }}
            />
          ))}
        </div>
        <main className="copy">
          <section className="chapter chapter--intro" aria-labelledby="intro-title"><div className="copy__block copy__block--left"><p className="eyebrow" data-copy>A little surprise, wrapped with love</p><h1 className="display" id="intro-title"><span className="line" data-copy>A little <em>surprise</em></span><span className="line" data-copy>is on its way...</span></h1><p className="lede" data-copy>It began in Dubai, among warm golden evenings and quiet wishes. Now it is crossing oceans and skies - travelling a very long way just to make you smile.</p><div className="scroll-hint" data-scroll-hint><span className="scroll-hint__line" />Scroll to begin</div></div></section>
          <section className="chapter chapter--dubai" aria-labelledby="dubai-title"><div className="copy__block copy__block--left"><p className="eyebrow" data-copy>Chapter one . Wrapped in Dubai</p><h2 className="display" id="dubai-title" data-copy>First, a little <em>something</em> was wrapped just for you.</h2><p className="lede" data-copy>Ribbons tied by hand, a tag written with care, and a tiny parcel carrying far more love than it looks like it could hold.</p><div className="shipping" data-copy><div className="shipping__item"><span className="shipping__label">From</span><span className="shipping__value">Dubai</span></div><div className="shipping__item"><span className="shipping__label">To</span><span className="shipping__value">Paris</span></div><div className="shipping__item"><span className="shipping__label">With</span><span className="shipping__value">Love</span></div></div></div></section>
          <section className="chapter chapter--journey" aria-labelledby="journey-title"><div className="copy__block copy__block--center"><p className="eyebrow" data-copy>Chapter two . The journey</p><h2 className="display" id="journey-title" data-copy>A small parcel. A <em>6,700 km</em> journey.</h2><p className="lede" data-copy>Across deserts, seas and skies - following a little golden trail all the way to you.</p></div></section>
          <section className="chapter chapter--bloom" aria-labelledby="bloom-title"><div className="copy__block copy__block--left"><p className="eyebrow" data-copy>Chapter three . A garden in bloom</p><h2 className="display" id="bloom-title" data-copy>Some things <em>bloom</em> when they are meant for you.</h2><p className="lede" data-copy>The flowers seemed to know you were waiting. And someone very small and very excited came along to make sure your gift arrived safely.</p></div></section>
          <section className="chapter chapter--arrival" aria-labelledby="arrival-title"><div className="copy__block copy__block--left"><p className="eyebrow" data-copy>Chapter four . Arrived in Paris</p><h2 className="display" id="arrival-title" data-copy>Touchdown, Paris. <em>Your gift is here.</em></h2><p className="lede" data-copy>A soft little landing, a parcel on the doorstep, and a tag that says it all: handle with love. It has come such a long way to reach you.</p></div></section>
          <section className="chapter chapter--unbox" aria-labelledby="unbox-title"><div className="copy__block copy__block--center"><p className="eyebrow" data-copy>Chapter five . The ribbon</p><h2 className="display" id="unbox-title" data-copy>One little ribbon between you and <em>your surprise.</em></h2><p className="lede" data-copy>Take a breath, make a wish, and open it slowly. It has been waiting a very long time to meet you.</p></div></section>
          <section className="chapter chapter--finale" aria-labelledby="finale-title"><div className="copy__block copy__block--center"><p className="eyebrow" data-copy>Chapter six . Delivered with love</p><h2 className="display" id="finale-title" data-copy>A little love, all the way from <em>Dubai.</em></h2><p className="lede" data-copy>I hope this made you smile. You deserve soft days, fresh flowers, and a tiny golden friend who is always happy to see you.</p><p className="signature" data-copy>{GIFT.recipient ? `For ${GIFT.recipient}, ${GIFT.signature.toLowerCase()}.` : `${GIFT.signature}.`}</p></div></section>
        </main>
        <div className="hud" aria-hidden="true">
          <div className="hud__top"><div className="hud__chapter"><span ref={chapterNumRef}>01</span><span className="hud__chapter-line" /><span ref={chapterNameRef}>A little surprise</span></div></div>
          <div className="hud__flight" data-flight-hud><div className="hud__flight-row"><span className="hud__flight-route">DXB ? ORY</span><span className="hud__flight-distance" ref={distanceRef}>0 km</span></div><div className="hud__flight-status" ref={statusRef}>Preparing for takeoff</div><div className="hud__flight-bar"><span ref={flightBarRef} /></div></div>
          <div className="hud__bottom"><span className="hud__meta">Dubai</span><div className="hud__progress"><span className="hud__progress-fill" ref={progressFillRef} /></div><span className="hud__meta">Paris</span></div>
        </div>
        <div className="finale-controls" data-finale-controls aria-hidden={finaleUi === 'none'}>
          {finaleUi === 'celebrate' && (
            <button className="finale-controls__btn finale-controls__btn--celebrate" type="button" onPointerDown={(e) => e.stopPropagation()} onClick={triggerFinaleCelebration}>Celebrate</button>
          )}
          {finaleUi === 'restart' && (
            <button className="finale-controls__btn finale-controls__btn--restart" type="button" onPointerDown={(e) => e.stopPropagation()} onClick={restartExperience}>Start again</button>
          )}
        </div>

        <div className="cutscene" ref={cutsceneRef} data-active="false" aria-hidden="true">
          <div className="cutscene__veil" />
          <div className="cutscene__scene cutscene__scene--door">
            <div className="doorway">
              <div className="doorway__frame"><div className="doorway__light" /><div className="doorway__door doorway__door--left"><span className="doorway__panel" /><span className="doorway__knob" /></div><div className="doorway__door doorway__door--right"><span className="doorway__panel" /></div></div>
              <div className="doorway__puppy"><svg viewBox="36 56 288 282"><Puppy withParcel crown withRose /></svg></div>
              <div className="doorway__bubbles" aria-hidden="true">
                {DOOR_HEARTS.map((h, i) => (
                  <span
                    key={i}
                    className="doorway__bubble"
                    style={{ left: `${h.left}%`, bottom: `${h.bottom}%`, width: h.size, height: h.size, background: h.color, animationDelay: `${h.delay}s`, animationDuration: `${h.dur}s`, ['--drift' as any]: `${h.drift}px`, opacity: h.opacity }}
                  />
                ))}
              </div>
            </div>
            <p className="cutscene__caption">A little friend is at your door</p>
          </div>
        </div>
        <div className="touch-hearts" ref={touchHeartsRef} aria-hidden="true" />
        <div className="celebration" ref={celebrationRef} aria-hidden="true" />
      </div>
      <div className="exp__track" aria-hidden="true" />
    </div>
  );
}
