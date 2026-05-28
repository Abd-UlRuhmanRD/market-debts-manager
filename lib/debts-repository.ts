import {
  DebtSection,
  Prisma,
  TransactionType,
  type DebtPerson,
  type DebtTransaction,
} from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type DebtSectionName = 'debts_on_market' | 'debts_from_customers';
export type TransactionTypeName = 'debt' | 'payment';

type PersonWithTransactions = DebtPerson & {
  transactions: DebtTransaction[];
};

export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const allowedSections: Record<DebtSectionName, DebtSection> = {
  debts_on_market: DebtSection.debts_on_market,
  debts_from_customers: DebtSection.debts_from_customers,
};

const allowedTypes: Record<TransactionTypeName, TransactionType> = {
  debt: TransactionType.debt,
  payment: TransactionType.payment,
};

function normalizeSection(section: unknown) {
  if (typeof section !== 'string' || !(section in allowedSections)) {
    throw new HttpError('قسم الديون غير صحيح.');
  }

  return allowedSections[section as DebtSectionName];
}

function normalizeTransactionType(type: unknown) {
  if (typeof type !== 'string' || !(type in allowedTypes)) {
    throw new HttpError('نوع المعاملة غير صحيح.');
  }

  return allowedTypes[type as TransactionTypeName];
}

function normalizeName(name: unknown) {
  const trimmedName = String(name || '').trim();

  if (!trimmedName) {
    throw new HttpError('اكتب الاسم أولًا.');
  }

  if (trimmedName.length > 120) {
    throw new HttpError('الاسم طويل جدًا.');
  }

  return trimmedName;
}

function normalizeAmount(amount: unknown) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new HttpError('أدخل مبلغًا صحيحًا أكبر من صفر.');
  }

  return new Prisma.Decimal((Math.round(numericAmount * 100) / 100).toFixed(2));
}

function normalizeDate(value: unknown) {
  if (typeof value !== 'string' || !value) {
    throw new HttpError('اختر تاريخًا صحيحًا.');
  }

  const date = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new HttpError('اختر تاريخًا صحيحًا.');
  }

  return date;
}

function mapTransaction(transaction: DebtTransaction) {
  return {
    id: transaction.id,
    type: transaction.type as TransactionTypeName,
    amount: Number(transaction.amount || 0),
    note: transaction.note || '',
    date: transaction.date.toISOString(),
  };
}

function mapPerson(person: PersonWithTransactions) {
  return {
    id: person.id,
    name: person.name,
    balance: Number(person.balance || 0),
    transactions: person.transactions.map(mapTransaction),
  };
}

export async function listPeople(section: unknown) {
  const normalizedSection = normalizeSection(section);

  const people = await prisma.debtPerson.findMany({
    where: { section: normalizedSection },
    include: {
      transactions: {
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      },
    },
    orderBy: { name: 'asc' },
  });

  return people.map(mapPerson);
}

export async function addPerson(section: unknown, name: unknown) {
  const normalizedSection = normalizeSection(section);
  const normalizedName = normalizeName(name);

  const person = await prisma.debtPerson.create({
    data: {
      section: normalizedSection,
      name: normalizedName,
    },
    include: {
      transactions: true,
    },
  });

  return mapPerson(person);
}

export async function removePerson(section: unknown, id: unknown) {
  const normalizedSection = normalizeSection(section);

  if (typeof id !== 'string' || !id) {
    throw new HttpError('معرّف السجل مطلوب.');
  }

  const result = await prisma.debtPerson.deleteMany({
    where: {
      id,
      section: normalizedSection,
    },
  });

  if (result.count === 0) {
    throw new HttpError('لم يتم العثور على السجل.', 404);
  }
}

export async function getTransactionsByPerson(section: unknown, personId: unknown) {
  const normalizedSection = normalizeSection(section);

  if (typeof personId !== 'string' || !personId) {
    throw new HttpError('معرّف الشخص مطلوب.');
  }

  const person = await prisma.debtPerson.findFirst({
    where: {
      id: personId,
      section: normalizedSection,
    },
    select: { id: true },
  });

  if (!person) {
    throw new HttpError('لم يتم العثور على السجل.', 404);
  }

  const transactions = await prisma.debtTransaction.findMany({
    where: {
      personId,
    },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });

  return transactions.map(mapTransaction);
}

export async function getSectionSummary(section: unknown) {
  const normalizedSection = normalizeSection(section);

  const result = await prisma.debtPerson.aggregate({
    where: { section: normalizedSection },
    _sum: {
      balance: true,
    },
  });

  return Number(result._sum.balance || 0);
}

export async function addTransaction(section: unknown, payload: Record<string, unknown>) {
  const normalizedSection = normalizeSection(section);
  const personId = payload.personId;
  const type = normalizeTransactionType(payload.type);
  const amount = normalizeAmount(payload.amount);
  const note = String(payload.note || '').trim().slice(0, 500);
  const date = normalizeDate(payload.date);

  if (typeof personId !== 'string' || !personId) {
    throw new HttpError('معرّف الشخص مطلوب.');
  }

  return prisma.$transaction(async (transactionClient) => {
    const person = await transactionClient.debtPerson.findFirst({
      where: {
        id: personId,
        section: normalizedSection,
      },
      select: { id: true },
    });

    if (!person) {
      throw new HttpError('لم يتم العثور على السجل.', 404);
    }

    const transaction = await transactionClient.debtTransaction.create({
      data: {
        personId,
        type,
        amount,
        note,
        date,
      },
    });

    await transactionClient.debtPerson.update({
      where: { id: personId },
      data: {
        balance:
          type === TransactionType.debt
            ? { increment: amount }
            : { decrement: amount },
      },
    });

    return mapTransaction(transaction);
  });
}
