'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import styles from './PasscodeGate.module.css';

export default function PasscodeGate() {
  const router = useRouter();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPasscode = passcode.replace(/\D/g, '').slice(0, 6);
    if (normalizedPasscode.length !== 6) {
      setError('请输入 6 位访问码');
      return;
    }

    setError('');

    try {
      const res = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: normalizedPasscode }),
        cache: 'no-store',
      });

      const data = await res.json().catch(() => ({ error: '验证失败，请重试' }));
      if (!res.ok || !data.success) {
        setPasscode('');
        setError(data.error || '访问码错误');
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch {
      setError('验证失败，请重试');
      setPasscode('');
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <p className={styles.badge}>Access Required</p>
        <h1 className={styles.title}>输入访问码继续</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={passcode}
            onChange={(event) => {
              setPasscode(event.target.value.replace(/\D/g, '').slice(0, 6));
              if (error) setError('');
            }}
            className={styles.input}
            placeholder="••••••"
            disabled={isPending}
            aria-label="6位访问码"
          />

          <p className={styles.error}>{error || ' '}</p>

          <button type="submit" className={styles.button} disabled={isPending}>
            {isPending ? '验证中...' : '进入工作坊'}
          </button>
        </form>
      </div>
    </div>
  );
}
