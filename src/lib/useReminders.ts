import { useEffect, useRef, useState } from 'react';
import { supabase } from './supabase';
import type { Reminder } from './api';

const CHECK_INTERVAL = 30_000;

interface FiredRecord {
  reminderId: string;
  minuteKey: string;
}

export function useReminders(reminders: Reminder[], onFire: (r: Reminder) => void) {
  const firedRef = useRef<FiredRecord[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(setPermission);
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const currentKey = `${hh}:${mm}`;

      for (const r of reminders) {
        if (!r.enabled) continue;
        if (r.time !== currentKey) continue;
        const already = firedRef.current.some(
          (f) => f.reminderId === r.id && f.minuteKey === currentKey,
        );
        if (already) continue;
        firedRef.current = [
          ...firedRef.current.filter((f) => f.reminderId !== r.id),
          { reminderId: r.id, minuteKey: currentKey },
        ];
        onFire(r);
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification('Aether System', { body: r.title });
          } catch {
            /* ignore */
          }
        }
      }
    };

    const interval = setInterval(check, CHECK_INTERVAL);
    check();
    return () => clearInterval(interval);
  }, [reminders, onFire]);
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied';
  if (Notification.permission === 'default') {
    return Notification.requestPermission();
  }
  return Notification.permission;
}
