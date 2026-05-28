-- CreateEnum
CREATE TYPE "DebtSection" AS ENUM ('debts_on_market', 'debts_from_customers');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('debt', 'payment');

-- CreateTable
CREATE TABLE "debt_people" (
    "id" UUID NOT NULL,
    "section" "DebtSection" NOT NULL,
    "name" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debt_people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "debt_transactions" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "debt_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "debt_people_section_name_idx" ON "debt_people"("section", "name");

-- CreateIndex
CREATE INDEX "debt_transactions_person_id_date_idx" ON "debt_transactions"("person_id", "date" DESC);

-- AddForeignKey
ALTER TABLE "debt_transactions" ADD CONSTRAINT "debt_transactions_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "debt_people"("id") ON DELETE CASCADE ON UPDATE CASCADE;
