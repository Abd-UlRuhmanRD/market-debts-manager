'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react';
import { fetchSummary, type DebtSectionName } from '@/lib/api/debts';
import { formatAmount } from '@/lib/format';

type DashboardProps = {
  collections: {
    fromCustomers: DebtSectionName;
    onMarket: DebtSectionName;
  };
  refreshKey: number;
};

const initialTotals = {
  fromCustomers: 0,
  onMarket: 0,
};

export default function Dashboard({ collections, refreshKey }: DashboardProps) {
  const [totals, setTotals] = useState(initialTotals);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadTotals() {
      try {
        const [fromCustomersResult, onMarketResult] = await Promise.all([
          fetchSummary(collections.fromCustomers),
          fetchSummary(collections.onMarket),
        ]);

        if (!isMounted) {
          return;
        }

        setTotals({
          fromCustomers: Math.max(Number(fromCustomersResult.totalBalance || 0), 0),
          onMarket: Math.max(Number(onMarketResult.totalBalance || 0), 0),
        });
        setError('');
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'تعذر تحميل ملخص الديون. تحقق من اتصال قاعدة البيانات.',
          );
        }
      }
    }

    loadTotals();
    const intervalId = window.setInterval(loadTotals, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [collections, refreshKey]);

  const netBalance = useMemo(
    () => totals.fromCustomers - totals.onMarket,
    [totals.fromCustomers, totals.onMarket],
  );

  const cards = [
    {
      label: 'المستحق على السوق',
      value: totals.fromCustomers,
      icon: ArrowUpRight,
      tone: 'green',
    },
    {
      label: 'المستحق للسوق',
      value: totals.onMarket,
      icon: ArrowDownLeft,
      tone: 'red',
    },
    {
      label: 'صافي الرصيد',
      value: netBalance,
      icon: Scale,
      tone: netBalance >= 0 ? 'green' : 'red',
    },
  ];

  return (
    <section className="dashboard" aria-label="ملخص الديون">
      {cards.map(({ label, value, icon: Icon, tone }) => (
        <article className={`stat-card ${tone}`} key={label}>
          <div className="stat-icon" aria-hidden="true">
            <Icon size={22} strokeWidth={2.25} />
          </div>
          <div>
            <p>{label}</p>
            <strong className="amount">{formatAmount(value)}</strong>
          </div>
        </article>
      ))}

      {error ? <p className="inline-error dashboard-error">{error}</p> : null}
    </section>
  );
}
