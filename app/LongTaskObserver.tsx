// app/LongTaskObserver.tsx
'use client';

import { useEffect, useRef } from 'react';

const ENABLED = process.env.NEXT_PUBLIC_ENABLE_LONGTASK_OBSERVER === '1'; // 任意

export default function LongTaskObserver() {
  const poRef = useRef<PerformanceObserver | null>(null);

  window.addEventListener('load', () => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    console.log('TTFB(ms)=', nav.responseStart, 'DOMLoad(ms)=', nav.domContentLoadedEventEnd, 'Load(ms)=', nav.loadEventEnd);
  });

  useEffect(() => {
    if (!ENABLED) return;
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    // すでに存在していたら切断（Strict Modeの二重マウント対策）
    poRef.current?.disconnect();

    try {
      const po = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceEntryList) {
          // longtask のみ拾う（他のエントリタイプは無視）
          // 200ms 超だけ警告にするなど閾値を設けるとノイズ減
          if (entry.entryType === 'longtask' && entry.duration > 200) {
            // 必要に応じて sendBeacon 等でサーバに送ってもOK
            // navigator.sendBeacon('/api/longtask', JSON.stringify({ d: entry.duration, s: entry.startTime }));
            // まずはコンソールで十分
            console.warn('Long task', Math.round(entry.duration), 'ms', entry);
          }
        }
      });

      // longtask を監視
      // 型定義の都合で `as any` を付けています（問題ありません）
      po.observe({ entryTypes: ['longtask'] });

      poRef.current = po;
    } catch {
      // 旧ブラウザ等で例外になっても無視
    }

    return () => {
      poRef.current?.disconnect();
      poRef.current = null;
    };
  }, []);

  return null;
}
