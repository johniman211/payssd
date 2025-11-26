import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const PaymentSuccessPage = () => {
  const [audioBlocked, setAudioBlocked] = useState(false);

  const playSuccessSound = async () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    try { await ctx.resume(); } catch {}
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.8;
    master.connect(ctx.destination);
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) { data[i] = Math.random() * 2 - 1; }
    noise.buffer = buffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2000;
    bp.Q.value = 8;
    const ng = ctx.createGain();
    ng.gain.value = 0.0001;
    noise.connect(bp);
    bp.connect(ng);
    ng.connect(master);
    noise.start(now);
    ng.gain.exponentialRampToValueAtTime(0.5, now + 0.005);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
    noise.stop(now + 0.06);
    const makeTone = (freq, start, dur, vol) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.connect(master);
      const o1 = ctx.createOscillator();
      o1.type = 'triangle';
      o1.frequency.setValueAtTime(freq, start);
      o1.detune.setValueAtTime(5, start);
      const o2 = ctx.createOscillator();
      o2.type = 'square';
      o2.frequency.setValueAtTime(freq * 2, start);
      o1.connect(g);
      o2.connect(g);
      g.gain.exponentialRampToValueAtTime(vol, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o1.start(start);
      o2.start(start);
      o1.stop(start + dur + 0.02);
      o2.stop(start + dur + 0.02);
    };
    makeTone(880, now + 0.02, 0.12, 0.4);
    makeTone(1318.51, now + 0.17, 0.14, 0.45);
  };

  useEffect(() => {
    playSuccessSound().catch(() => setAudioBlocked(true));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Your payment has been processed successfully.</p>
          {audioBlocked && (
            <div className="mt-4">
              <button
                onClick={() => playSuccessSound().then(() => setAudioBlocked(false)).catch(() => {})}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Play Success Sound
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
