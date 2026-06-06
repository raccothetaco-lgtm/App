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
    <div className="w-full bg-neutral-900/50 backdrop-blur-sm p-2 sm:p-3 flex items-center justify-center">
      <div id="container-20df35551593985326b4926cceef35ee" className="w-full max-w-full" />
    </div>
  );
}
