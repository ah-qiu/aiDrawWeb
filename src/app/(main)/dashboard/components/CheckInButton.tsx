'use client';

import { useState } from 'react';

export function CheckInButton() {
    const [loading, setLoading] = useState(false);
    const [checkedIn, setCheckedIn] = useState(false);
    const [message, setMessage] = useState('');

    const handleCheckIn = async () => {
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/checkin', { method: 'POST' });
            const data = await res.json();

            if (data.success) {
                setCheckedIn(true);
                setMessage(data.message);
            } else if (data.alreadyCheckedIn) {
                setCheckedIn(true);
                setMessage(data.message);
            } else {
                setMessage(data.error || '签到失败');
            }
        } catch {
            setMessage('网络错误，请重试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleCheckIn}
                disabled={loading || checkedIn}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${checkedIn ? 'bg-green-500/20 text-green-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90'
                    }`}
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        签到中...
                    </span>
                ) : checkedIn ? '✓ 今日已签到' : '立即签到'}
            </button>
            {message && <p className={`mt-2 text-sm text-center ${checkedIn ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
        </div>
    );
}
