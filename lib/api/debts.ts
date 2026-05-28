export type DebtSectionName = 'debts_on_market' | 'debts_from_customers';
export type TransactionTypeName = 'debt' | 'payment';

export type DebtTransaction = {
  id: string;
  type: TransactionTypeName;
  amount: number;
  note: string;
  date: string;
};

export type DebtPerson = {
  id: string;
  name: string;
  balance: number;
  transactions: DebtTransaction[];
};

export type TransactionInput = {
  personId: string;
  type: TransactionTypeName;
  amount: number;
  note: string;
  date: string;
};

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: string;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const response = await fetch(path, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    message?: string;
    detail?: string;
  };

  if (!response.ok) {
    const detail = data.detail || data.message || `خطأ ${response.status}`;
    throw new Error(detail);
  }

  return data;
}

export function fetchPeople(section: DebtSectionName) {
  return request<{ people: DebtPerson[] }>(
    `/api/people?section=${encodeURIComponent(section)}`,
  );
}

export function createPerson(section: DebtSectionName, name: string) {
  return request<{ person: DebtPerson }>('/api/people', {
    method: 'POST',
    body: JSON.stringify({ section, name }),
  });
}

export function deletePerson(section: DebtSectionName, id: string) {
  return request<{ ok: true }>(
    `/api/people?section=${encodeURIComponent(section)}&id=${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    },
  );
}

export function fetchTransactions(section: DebtSectionName, personId: string) {
  return request<{ transactions: DebtTransaction[] }>(
    `/api/transactions?section=${encodeURIComponent(section)}&personId=${encodeURIComponent(
      personId,
    )}`,
  );
}

export function createTransaction(section: DebtSectionName, transaction: TransactionInput) {
  return request<{ transaction: DebtTransaction }>('/api/transactions', {
    method: 'POST',
    body: JSON.stringify({ section, ...transaction }),
  });
}

export function fetchSummary(section: DebtSectionName) {
  return request<{ totalBalance: number }>(
    `/api/summary?section=${encodeURIComponent(section)}`,
  );
}
