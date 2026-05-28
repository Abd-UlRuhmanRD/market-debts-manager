'use client';

import { useMemo, useState } from 'react';
import { ChevronUp, History, PlusCircle, Trash2 } from 'lucide-react';
import { formatAmount, formatDate } from '@/lib/format';
import type { DebtPerson } from '@/lib/api/debts';

type PersonCardProps = {
  person: DebtPerson;
  onAddTransaction: (person: DebtPerson) => void;
  onDelete: (person: DebtPerson) => void;
  disabled: boolean;
};

export default function PersonCard({
  person,
  onAddTransaction,
  onDelete,
  disabled,
}: PersonCardProps) {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const balance = Number(person.balance || 0);
  const transactions = Array.isArray(person.transactions) ? person.transactions : [];

  const orderedTransactions = useMemo(
    () =>
      [...transactions].sort((first, second) => {
        const firstDate = new Date(first.date).getTime() || 0;
        const secondDate = new Date(second.date).getTime() || 0;
        return secondDate - firstDate;
      }),
    [transactions],
  );

  const balanceTone = balance > 0 ? 'danger' : 'settled';

  return (
    <article className="person-card">
      <div className="person-summary">
        <div>
          <h3>{person.name}</h3>
          <p>الرصيد الحالي</p>
        </div>
        <strong className={`person-balance amount ${balanceTone}`}>
          {formatAmount(balance)}
        </strong>
      </div>

      <div className="person-actions">
        <button type="button" onClick={() => onAddTransaction(person)} disabled={disabled}>
          <PlusCircle size={18} aria-hidden="true" />
          إضافة معاملة
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={() => setIsHistoryOpen((current) => !current)}
          aria-expanded={isHistoryOpen}
        >
          {isHistoryOpen ? (
            <ChevronUp size={18} aria-hidden="true" />
          ) : (
            <History size={18} aria-hidden="true" />
          )}
          عرض السجل
        </button>
        <button
          type="button"
          className="danger-button"
          onClick={() => onDelete(person)}
          disabled={disabled}
        >
          <Trash2 size={18} aria-hidden="true" />
          حذف
        </button>
      </div>

      {isHistoryOpen ? (
        <div className="transaction-history">
          {orderedTransactions.length === 0 ? (
            <p className="empty-state compact">لا توجد معاملات بعد.</p>
          ) : (
            <ul>
              {orderedTransactions.map((transaction) => {
                const isDebt = transaction.type === 'debt';

                return (
                  <li key={transaction.id}>
                    <div>
                      <span className={`transaction-type ${isDebt ? 'debt' : 'payment'}`}>
                        {isDebt ? 'دين جديد' : 'سداد'}
                      </span>
                      <time>{formatDate(transaction.date)}</time>
                      {transaction.note ? <p>{transaction.note}</p> : null}
                    </div>
                    <strong className={`amount ${isDebt ? 'danger' : 'settled'}`}>
                      {isDebt ? '+' : '-'}
                      {formatAmount(transaction.amount)}
                    </strong>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </article>
  );
}
