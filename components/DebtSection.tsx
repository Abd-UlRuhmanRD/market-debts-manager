'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  createPerson,
  createTransaction,
  deletePerson,
  fetchPeople,
  type DebtPerson,
  type DebtSectionName,
  type TransactionInput,
} from '@/lib/api/debts';
import PersonCard from '@/components/PersonCard';
import TransactionModal, { type TransactionFormValues } from '@/components/TransactionModal';

export type SectionConfig = {
  id: string;
  title: string;
  subtitle: string;
  collectionName: DebtSectionName;
  addPlaceholder: string;
  emptyMessage: string;
};

type DebtSectionProps = {
  section: SectionConfig;
  onDataChanged?: () => void;
};

export default function DebtSection({ section, onDataChanged }: DebtSectionProps) {
  const [people, setPeople] = useState<DebtPerson[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<DebtPerson | null>(null);

  const sectionName = useMemo(() => section.collectionName, [section.collectionName]);

  useEffect(() => {
    let isMounted = true;

    async function loadPeople() {
      try {
        const data = await fetchPeople(sectionName);

        if (!isMounted) {
          return;
        }

        setPeople(data.people.sort((a, b) => a.name.localeCompare(b.name, 'ar')));
        setLoading(false);
        setError('');
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'تعذر تحميل البيانات. تحقق من اتصال قاعدة البيانات.',
          );
          setLoading(false);
        }
      }
    }

    loadPeople();
    const intervalId = window.setInterval(loadPeople, 10000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [sectionName]);

  async function reloadSection() {
    const data = await fetchPeople(sectionName);
    setPeople(data.people.sort((a, b) => a.name.localeCompare(b.name, 'ar')));
    onDataChanged?.();
  }

  async function handleAddPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('اكتب الاسم أولًا.');
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await createPerson(sectionName, trimmedName);
      await reloadSection();
      setName('');
    } catch (addError) {
      setError(addError instanceof Error ? addError.message : 'تعذر إضافة الاسم. حاول مرة أخرى.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeletePerson(person: DebtPerson) {
    const confirmed = window.confirm(
      `هل تريد حذف "${person.name}"؟ سيتم حذف الرصيد والسجل بالكامل.`,
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      await deletePerson(sectionName, person.id);
      await reloadSection();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'تعذر حذف السجل. حاول مرة أخرى.',
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveTransaction({ type, amount, note, date }: TransactionFormValues) {
    if (!selectedPerson) {
      return;
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error('أدخل مبلغًا صحيحًا أكبر من صفر.');
    }

    const transaction: TransactionInput = {
      personId: selectedPerson.id,
      type,
      amount: numericAmount,
      note: note.trim(),
      date,
    };

    await createTransaction(sectionName, transaction);
    await reloadSection();
    setSelectedPerson(null);
  }

  return (
    <section className="debt-section" aria-labelledby={`${section.id}-title`}>
      <div className="section-heading">
        <div>
          <h2 id={`${section.id}-title`}>{section.title}</h2>
          <p>{section.subtitle}</p>
        </div>
      </div>

      <form className="add-person-form" onSubmit={handleAddPerson}>
        <label className="sr-only" htmlFor={`${section.id}-name`}>
          {section.addPlaceholder}
        </label>
        <input
          id={`${section.id}-name`}
          type="text"
          value={name}
          placeholder={section.addPlaceholder}
          onChange={(event) => setName(event.target.value)}
          disabled={actionLoading}
        />
        <button type="submit" disabled={actionLoading}>
          <Plus size={18} aria-hidden="true" />
          إضافة
        </button>
      </form>

      {error ? <p className="inline-error">{error}</p> : null}

      <div className="people-list">
        {loading ? <p className="empty-state">جار تحميل البيانات...</p> : null}

        {!loading && people.length === 0 ? (
          <p className="empty-state">{section.emptyMessage}</p>
        ) : null}

        {people.map((person) => (
          <PersonCard
            key={person.id}
            person={person}
            onAddTransaction={setSelectedPerson}
            onDelete={handleDeletePerson}
            disabled={actionLoading}
          />
        ))}
      </div>

      <TransactionModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
        onSave={handleSaveTransaction}
      />
    </section>
  );
}
