import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

type AdInterstitialProps = {
  onComplete: () => void;
};

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdInterstitial({ onComplete }: AdInterstitialProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Load AdSense script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3884161160129129';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    script.onload = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('AdSense error:', e);
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-neutral-950 z-50 flex flex-col items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-50 mb-2">
            Loading Session
          </h2>
          <p className="text-sm text-neutral-400">
            {countdown > 0 ? `Continue in ${countdown}s` : 'Ready to continue'}
          </p>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-4 min-h-[250px] flex items-center justify-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-3884161160129129"
            data-ad-slot="7793799535"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

        {countdown === 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onComplete}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 py-4 font-semibold transition-colors"
          >
            Continue to Session
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
