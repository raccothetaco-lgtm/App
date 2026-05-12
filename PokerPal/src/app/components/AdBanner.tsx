import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <div className="w-full bg-neutral-900/50 backdrop-blur-sm p-2 sm:p-3">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3884161160129129"
        data-ad-slot="7793799535"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
