import { User, Account, Transaction, LoanApplication, Loan } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    password: 'admin1237575@@xyz',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@banqueatlantique.com',
    phone: '+33123456789',
    address: '123 Rue de la Banque, Paris',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    username: 'client1',
    password: 'client123',
    role: 'client',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33987654321',
    address: '456 Avenue des Clients, Lyon',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    username: 'client2',
    password: 'client123',
    role: 'client',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@email.com',
    phone: '+33456789123',
    address: '789 Boulevard du Commerce, Marseille',
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const mockAccounts: Account[] = [
  {
    id: '1',
    userId: '2',
    accountNumber: 'BA-001-2024-001',
    accountType: 'savings',
    balance: 15000,
    currency: 'EUR',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    userId: '2',
    accountNumber: 'BA-001-2024-002',
    accountType: 'current',
    balance: 3500,
    currency: 'EUR',
    status: 'active',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: '3',
    userId: '3',
    accountNumber: 'BA-002-2024-001',
    accountType: 'savings',
    balance: 8750,
    currency: 'EUR',
    status: 'active',
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    fromAccountId: '1',
    toAccountId: '2',
    amount: 500,
    currency: 'EUR',
    type: 'transfer',
    description: 'Virement interne',
    status: 'completed',
    createdAt: '2024-12-01T10:30:00Z'
  },
  {
    id: '2',
    toAccountId: '1',
    amount: 2000,
    currency: 'EUR',
    type: 'deposit',
    description: 'Dépôt initial',
    status: 'completed',
    createdAt: '2024-11-28T14:15:00Z'
  },
  {
    id: '3',
    fromAccountId: '3',
    amount: 1250,
    currency: 'EUR',
    type: 'withdrawal',
    description: 'Retrait ATM',
    status: 'completed',
    createdAt: '2024-11-30T16:45:00Z'
  }
];

export const mockLoanApplications: LoanApplication[] = [
  {
    id: '1',
    userId: '2',
    loanType: 'personal',
    amount: 10000,
    currency: 'EUR',
    duration: 24,
    interestRate: 5.5,
    purpose: 'Rénovation domicile',
    monthlyIncome: 3500,
    status: 'pending',
    createdAt: '2024-11-25T09:00:00Z'
  },
  {
    id: '2',
    userId: '3',
    loanType: 'investment',
    amount: 25000,
    currency: 'EUR',
    duration: 36,
    interestRate: 4.8,
    purpose: 'Expansion commerce',
    monthlyIncome: 5200,
    status: 'approved',
    createdAt: '2024-11-20T11:30:00Z',
    reviewedAt: '2024-11-22T15:45:00Z',
    reviewedBy: '1'
  }
];

export const mockLoans: Loan[] = [
  {
    id: '1',
    applicationId: '2',
    userId: '3',
    amount: 25000,
    currency: 'EUR',
    interestRate: 4.8,
    duration: 36,
    monthlyPayment: 742.50,
    remainingBalance: 23500,
    nextPaymentDate: '2024-12-15T00:00:00Z',
    status: 'active',
    createdAt: '2024-11-22T16:00:00Z'
  }
];