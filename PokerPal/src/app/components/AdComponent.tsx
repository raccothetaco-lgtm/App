import { useEffect, useRef } from 'react';

type AdComponentProps = {
  publisherId: string;
  adSlot: string;
};

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdComponent({ publisherId, adSlot }: AdComponentProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // Push ad after a short delay to ensure script is loaded
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log('AdSense ad pushed');
        }
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-full flex items-center justify-center min-h-[200px] py-4">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={`ca-${publisherId}`}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
