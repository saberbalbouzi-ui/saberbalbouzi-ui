import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Counters {
  view_count: number;
  phone_click_count: number;
  whatsapp_click_count: number;
  balance_credits: number;
}

const emptyCounters: Counters = {
  view_count: 0,
  phone_click_count: 0,
  whatsapp_click_count: 0,
  balance_credits: 0,
};

export function useRealtimeCounters(
  raqiId: string | undefined,
  initialCounters?: Partial<Counters>
): Counters & { isLive: boolean } {
  const [counters, setCounters] = useState<Counters>({
    ...emptyCounters,
    ...initialCounters,
  });

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!raqiId) {
      setCounters(emptyCounters);
      setIsLive(false);
      return;
    }

    let mounted = true;

    const loadCounters = async () => {
      const { data, error } = await supabase
        .from('raqis')
        .select(`
          view_count,
          phone_click_count,
          whatsapp_click_count,
          balance_credits
        `)
        .eq('id', raqiId)
        .single();

      if (error) {
        console.error('Error loading raqi counters:', error);
        return;
      }

      if (mounted && data) {
        setCounters({
          view_count: Number(data.view_count ?? 0),
          phone_click_count: Number(data.phone_click_count ?? 0),
          whatsapp_click_count: Number(data.whatsapp_click_count ?? 0),
          balance_credits: Number(data.balance_credits ?? 0),
        });
      }
    };

    loadCounters();

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
          const newData = payload.new as Partial<Counters>;

          setCounters((prev) => ({
            view_count: Number(newData.view_count ?? prev.view_count),
            phone_click_count: Number(
              newData.phone_click_count ?? prev.phone_click_count
            ),
            whatsapp_click_count: Number(
              newData.whatsapp_click_count ?? prev.whatsapp_click_count
            ),
            balance_credits: Number(
              newData.balance_credits ?? prev.balance_credits
            ),
          }));
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      mounted = false;
      setIsLive(false);
      supabase.removeChannel(channel);
    };
  }, [raqiId]);

  // مهم: تحديث القيم عندما تصل بيانات raqi بعد أول Render
  useEffect(() => {
    if (!raqiId || !initialCounters) return;

    setCounters((prev) => ({
      view_count: Number(initialCounters.view_count ?? prev.view_count),
      phone_click_count: Number(
        initialCounters.phone_click_count ?? prev.phone_click_count
      ),
      whatsapp_click_count: Number(
        initialCounters.whatsapp_click_count ?? prev.whatsapp_click_count
      ),
      balance_credits: Number(
        initialCounters.balance_credits ?? prev.balance_credits
      ),
    }));
  }, [
    raqiId,
    initialCounters?.view_count,
    initialCounters?.phone_click_count,
    initialCounters?.whatsapp_click_count,
    initialCounters?.balance_credits,
  ]);

  return {
    ...counters,
    isLive,
  };
}