// ============================================================
// Hook temps réel pour les compteurs (vus, appels, WhatsApp)
// ============================================================
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Raqi } from '@/types';

interface Counters {
  view_count: number;
  phone_click_count: number;
  whatsapp_click_count: number;
}

export function useRealtimeCounters(
  raqiId: string | undefined,
  initialCounters?: Partial<Counters>
): Counters & { isLive: boolean } {
  const [counters, setCounters] = useState<Counters>({
    view_count: initialCounters?.view_count ?? 0,
    phone_click_count: initialCounters?.phone_click_count ?? 0,
    whatsapp_click_count: initialCounters?.whatsapp_click_count ?? 0,
  });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!raqiId) return;

    const channel = supabase
      .channel(`raqi-counters-${raqiId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'raqis',
          filter: `id=eq.${raqiId}`,
        },
        (payload) => {
          const newData = payload.new as Partial<Raqi>;
          setCounters((prev) => ({
            view_count: newData.view_count ?? prev.view_count,
            phone_click_count: newData.phone_click_count ?? prev.phone_click_count,
            whatsapp_click_count: newData.whatsapp_click_count ?? prev.whatsapp_click_count,
          }));
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [raqiId]);

  return { ...counters, isLive };
}
