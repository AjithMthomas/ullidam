"use client";

import { useSyncExternalStore } from "react";

/**
 * Monsoon rain, synthesised live with the Web Audio API (spec Rule 6): no
 * audio files, instant start, zero download. Three noise layers are shaped
 * into the hiss of rain, the patter on leaves with slow gusts, and a distant
 * low rumble. It never plays until the visitor asks for it.
 */
type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

let context: AudioContext | null = null;
let master: GainNode | null = null;
let playing = false;
let suspendTimer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

const MASTER_LEVEL = 0.55;

function notify() {
  listeners.forEach((listener) => listener());
}

function noiseBuffer(ctx: AudioContext, kind: "pink" | "brown", seconds = 6): AudioBuffer {
  const buffer = ctx.createBuffer(2, ctx.sampleRate * seconds, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      if (kind === "pink") {
        // Paul Kellet's refined pink-noise filter.
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
    }
  }
  return buffer;
}

function layer(ctx: AudioContext, buffer: AudioBuffer, filters: BiquadFilterNode[], level: number, destination: AudioNode) {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const gain = ctx.createGain();
  gain.gain.value = level;
  let node: AudioNode = source;
  for (const filter of filters) {
    node.connect(filter);
    node = filter;
  }
  node.connect(gain).connect(destination);
  // Start each loop at a different point so the layers never align audibly.
  source.start(0, Math.random() * buffer.duration);
  return gain;
}

function filter(ctx: AudioContext, type: BiquadFilterType, frequency: number, q = 0.7) {
  const node = ctx.createBiquadFilter();
  node.type = type;
  node.frequency.value = frequency;
  node.Q.value = q;
  return node;
}

function build(): boolean {
  if (context) return true;
  const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
  if (!Ctor) return false;
  const ctx = new Ctor();
  const out = ctx.createGain();
  out.gain.value = 0;
  out.connect(ctx.destination);

  const pink = noiseBuffer(ctx, "pink");
  const brown = noiseBuffer(ctx, "brown");

  layer(ctx, pink, [filter(ctx, "highpass", 450), filter(ctx, "lowpass", 7200)], 0.5, out);
  const patter = layer(ctx, pink, [filter(ctx, "bandpass", 2600, 0.6)], 0.32, out);
  layer(ctx, brown, [filter(ctx, "lowpass", 260)], 0.38, out);

  // Slow gusts: a 0.07 Hz swell on the patter layer.
  const lfo = ctx.createOscillator();
  const depth = ctx.createGain();
  lfo.frequency.value = 0.07;
  depth.gain.value = 0.14;
  lfo.connect(depth).connect(patter.gain);
  lfo.start();

  context = ctx;
  master = out;
  return true;
}

async function start() {
  if (!build() || !context || !master) return;
  clearTimeout(suspendTimer);
  // Respond at once; the fade-in is scheduled before the context resumes.
  playing = true;
  notify();
  const now = context.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(MASTER_LEVEL, now + 2.5);
  try {
    await context.resume();
  } catch {
    // The browser refused audio (no user gesture): say so honestly.
    playing = false;
    notify();
  }
}

function stop() {
  if (!context || !master) return;
  const now = context.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(0, now + 1.2);
  const ctx = context;
  suspendTimer = setTimeout(() => void ctx.suspend(), 1400);
  playing = false;
  notify();
}

export function toggleRain() {
  if (playing) stop();
  else void start();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useRainPlaying(): boolean {
  return useSyncExternalStore(subscribe, () => playing, () => false);
}
