'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import styles from './PasscodeGate.module.css';

interface PasscodeGateProps {
  children: React.ReactNode;
}

export default function PasscodeGate({ children }: PasscodeGateProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if already authenticated via lightweight auth check
  useEffect(() => {
    fetch('/api/check-auth')
      .then(res => {
        if (res.ok) setAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const submitPasscode = useCallback(async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verify-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      });
      const data = await res.json();
      if (data.success) {
        setAuthenticated(true);
      } else {
        setError(data.error || '访问码错误');
        setShaking(true);
        setTimeout(() => {
          setShaking(false);
          setDigits(['', '', '', '', '', '']);
          inputRefs.current[0]?.focus();
        }, 600);
      }
    } catch {
      setError('验证失败，请重试');
      setShaking(true);
      setTimeout(() => {
        setShaking(false);
        setDigits(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 600);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (digit && index === 5) {
      const code = newDigits.join('');
      if (code.length === 6) {
        submitPasscode(code);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const code = digits.join('');
      if (code.length === 6) {
        submitPasscode(code);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
    if (pasted.length === 6) {
      submitPasscode(pasted);
    }
  };

  if (checking) {
    return (
      <div className={styles.overlay}>
        <div className={styles.loadingDot} />
      </div>
    );
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.particles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={styles.particle} style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${8 + Math.random() * 12}s`,
          }} />
        ))}
      </div>

      <div className={`${styles.card} ${shaking ? styles.shake : ''}`}>
        <div className={styles.lockIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>

        <h1 className={styles.title}>访问验证</h1>
        <p className={styles.subtitle}>请输入6位访问码以继续</p>

        <div className={styles.inputGroup} onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`${styles.digitInput} ${digit ? styles.filled : ''} ${error ? styles.errorInput : ''}`}
              disabled={loading}
              autoFocus={i === 0}
              aria-label={`第 ${i + 1} 位数字`}
            />
          ))}
        </div>

        {error && (
          <p className={styles.errorText}>{error}</p>
        )}

        {loading && (
          <div className={styles.loadingBar}>
            <div className={styles.loadingProgress} />
          </div>
        )}

        <p className={styles.hint}>输入完成后将自动验证</p>
      </div>
    </div>
  );
}
