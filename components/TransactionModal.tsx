'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Save, X } from 'lucide-react';
import type { DebtPerson, TransactionTypeName } from '@/lib/api/debts';

export type TransactionFormValues = {
  type: TransactionTypeName;
  amount: string;
  note: string;
  date: string;
};

type TransactionModalProps = {
  person: DebtPerson | null;
  onClose: () => void;
  onSave: (values: TransactionFormValues) => Promise<void>;
};

function todayInputValue() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function TransactionModal({ person, onClose, onSave }: TransactionModalProps) {
  const [type, setType] = useState<TransactionTypeName>('debt');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayInputValue());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const title = useMemo(
    () => (person ? `إضافة معاملة: ${person.name}` : 'إضافة معاملة'),
    [person],
  );

  useEffect(() => {
    if (person) {
      setType('debt');
      setAmount('');
      setNote('');
      setDate(todayInputValue());
      setError('');
      setSaving(false);
    }
  }, [person]);

  useEffect(() => {
    if (!person) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, person]);

  if (!person) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await onSave({ type, amount, note, date });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'تعذر حفظ المعاملة.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="transaction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="transaction-modal-title">{title}</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="إغلاق"
            disabled={saving}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          <label>
            نوع المعاملة
            <select
              value={type}
              onChange={(event) => setType(event.target.value as TransactionTypeName)}
            >
              <option value="debt">دين جديد</option>
              <option value="payment">سداد</option>
            </select>
          </label>

          <label>
            المبلغ
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
              required
            />
          </label>

          <label>
            التاريخ
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
            />
          </label>

          <label>
            ملاحظة
            <textarea
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="اختياري"
            />
          </label>

          {error ? <p className="inline-error">{error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>
              إلغاء
            </button>
            <button type="submit" disabled={saving}>
              <Save size={18} aria-hidden="true" />
              حفظ
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
