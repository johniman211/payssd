import React, { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const PaymentSuccessPage = () => {
  const [audioBlocked, setAudioBlocked] = useState(false);

  const playSuccessSound = async () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    try {
      await ctx.resume();
    } catch {}
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.connect(ctx.destination);
    const tone = (freq, start, dur, vol, type = 'square') => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      osc.connect(gain);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    };
    tone(800, now, 0.09, 0.3);
    tone(1200, now + 0.11, 0.12, 0.35);
    tone(600, now + 0.26, 0.08, 0.25, 'triangle');
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
