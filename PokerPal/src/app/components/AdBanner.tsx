import { useEffect } from 'react';

export function AdBanner() {
  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.src = 'https://pl29652959.effectivecpmnetwork.com/20df35551593985326b4926cceef35ee/invoke.js';

    const container = document.getElementById('container-20df35551593985326b4926cceef35ee');
    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container && container.contains(script)) {
        container.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="w-full bg-neutral-900/30 backdrop-blur-sm py-1 px-2 flex items-center justify-center border-t border-neutral-800">
      <div
        id="container-20df35551593985326b4926cceef35ee"
        className="w-full max-w-2xl overflow-hidden"
        style={{ maxHeight: '60px' }}
      />
    </div>
  );
}
