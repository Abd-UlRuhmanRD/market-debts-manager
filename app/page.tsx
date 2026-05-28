'use client';

import { useMemo, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import DebtSection, { type SectionConfig } from '@/components/DebtSection';

const sections: SectionConfig[] = [
  {
    id: 'from-customers',
    title: 'ديون على الزبائن',
    subtitle: 'مبالغ مستحقة للسوق عند الزبائن',
    collectionName: 'debts_from_customers',
    addPlaceholder: 'اسم الزبون',
    emptyMessage: 'لا توجد ديون مسجلة على الزبائن.',
  },
  {
    id: 'on-market',
    title: 'ديون على السوق',
    subtitle: 'مبالغ مستحقة للموردين أو جهات أخرى',
    collectionName: 'debts_on_market',
    addPlaceholder: 'اسم المورد أو الجهة',
    emptyMessage: 'لا توجد ديون مسجلة على السوق.',
  },
];

export default function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const dashboardCollections = useMemo(
    () => ({
      fromCustomers: sections[0].collectionName,
      onMarket: sections[1].collectionName,
    }),
    [],
  );

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">دفتر السوق</p>
          <h1>إدارة الديون</h1>
        </div>
      </header>

      <Dashboard collections={dashboardCollections} refreshKey={refreshKey} />

      <div className="sections-grid">
        {sections.map((section) => (
          <DebtSection
            key={section.id}
            section={section}
            onDataChanged={() => setRefreshKey((current) => current + 1)}
          />
        ))}
      </div>
    </main>
  );
}
