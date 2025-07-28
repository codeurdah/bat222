import { supabase } from '../lib/supabase';
import { User, Account, Transaction, LoanApplication, Loan } from '../types';
import { logger } from '../utils/logger';

// Service pour les utilisateurs
export const userService = {
  async getAll(): Promise<User[]> {
    try {
      console.log('🔍 Tentative de récupération de tous les utilisateurs...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur Supabase lors de la récupération des utilisateurs:', error);
        throw error;
      }
      console.log('✅ Utilisateurs récupérés avec succès:', data?.length || 0);
      return data || [];
    } catch (error) {
      logger.error('Error fetching users', error as Error);
      throw error;
    }
  },

  async getById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching user by ID', error as Error);
      return null;
    }
  },

  async getByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error fetching user by username', error as Error);
      return null;
    }
  },

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      console.log('🔍 Tentative de création d\'utilisateur:', {
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: user.username,
          password_hash: user.password, // En production, hasher le mot de passe
          role: user.role,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          phone: user.phone,
          address: user.address
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur Supabase lors de la création d\'utilisateur:', error);
        console.error('Code d\'erreur:', error.code);
        console.error('Message:', error.message);
        console.error('Détails:', error.details);
        throw error;
      }
      
      console.log('✅ Utilisateur créé avec succès:', data);
      return {
        id: data.id,
        username: data.username,
        password: data.password_hash,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        createdAt: data.created_at
      };
    } catch (error) {
      logger.error('Error creating user', error as Error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          email: updates.email,
          phone: updates.phone,
          address: updates.address
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        username: data.username,
        password: data.password_hash,
        role: data.role,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        createdAt: data.created_at
      };
    } catch (error) {
      logger.error('Error updating user', error as Error);
      throw error;
    }
  }
};

// Service pour les comptes
export const accountService = {
  async getByUserId(userId: string): Promise<Account[]> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(account => ({
        id: account.id,
        userId: account.user_id,
        accountNumber: account.account_number,
        accountType: account.account_type,
        balance: parseFloat(account.balance),
        currency: account.currency,
        status: account.status,
        createdAt: account.created_at
      }));
    } catch (error) {
      logger.error('Error fetching accounts by user ID', error as Error);
      throw error;
    }
  },

  async getAll(): Promise<Account[]> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(account => ({
        id: account.id,
        userId: account.user_id,
        accountNumber: account.account_number,
        accountType: account.account_type,
        balance: parseFloat(account.balance),
        currency: account.currency,
        status: account.status,
        createdAt: account.created_at
      }));
    } catch (error) {
      logger.error('Error fetching all accounts', error as Error);
      throw error;
    }
  },

  async create(account: Omit<Account, 'id' | 'createdAt'>): Promise<Account> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          user_id: account.userId,
          account_number: account.accountNumber,
          account_type: account.accountType,
          balance: account.balance,
          currency: account.currency,
          status: account.status
        }])
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        userId: data.user_id,
        accountNumber: data.account_number,
        accountType: data.account_type,
        balance: parseFloat(data.balance),
        currency: data.currency,
        status: data.status,
        createdAt: data.created_at
      };
    } catch (error) {
      logger.error('Error creating account', error as Error);
      throw error;
    }
  }
};

// Service pour les transactions
export const transactionService = {
  async getByAccountIds(accountIds: string[]): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .or(`from_account_id.in.(${accountIds.join(',')}),to_account_id.in.(${accountIds.join(',')})`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transaction => ({
        id: transaction.id,
        fromAccountId: transaction.from_account_id,
        toAccountId: transaction.to_account_id,
        amount: parseFloat(transaction.amount),
        currency: transaction.currency,
        type: transaction.type,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.created_at
      }));
    } catch (error) {
      logger.error('Error fetching transactions by account IDs', error as Error);
      throw error;
    }
  },

  async getAll(): Promise<Transaction[]> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(transaction => ({
        id: transaction.id,
        fromAccountId: transaction.from_account_id,
        toAccountId: transaction.to_account_id,
        amount: parseFloat(transaction.amount),
        currency: transaction.currency,
        type: transaction.type,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.created_at
      }));
    } catch (error) {
      logger.error('Error fetching all transactions', error as Error);
      throw error;
    }
  },

  async create(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          from_account_id: transaction.fromAccountId,
          to_account_id: transaction.toAccountId,
          amount: transaction.amount,
          currency: transaction.currency,
          type: transaction.type,
          description: transaction.description,
          status: transaction.status
        }])
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        fromAccountId: data.from_account_id,
        toAccountId: data.to_account_id,
        amount: parseFloat(data.amount),
        currency: data.currency,
        type: data.type,
        description: data.description,
        status: data.status,
        createdAt: data.created_at
      };
    } catch (error) {
      logger.error('Error creating transaction', error as Error);
      throw error;
    }
  }
};

// Service pour les demandes de crédit
export const loanApplicationService = {
  async getAll(): Promise<LoanApplication[]> {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(app => ({
        id: app.id,
        userId: app.user_id,
        loanType: app.loan_type,
        amount: parseFloat(app.amount),
        currency: app.currency,
        duration: app.duration,
        interestRate: parseFloat(app.interest_rate),
        purpose: app.purpose,
        monthlyIncome: parseFloat(app.monthly_income),
        status: app.status,
        createdAt: app.created_at,
        reviewedAt: app.reviewed_at,
        reviewedBy: app.reviewed_by
      }));
    } catch (error) {
      logger.error('Error fetching loan applications', error as Error);
      throw error;
    }
  },

  async getByUserId(userId: string): Promise<LoanApplication[]> {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(app => ({
        id: app.id,
        userId: app.user_id,
        loanType: app.loan_type,
        amount: parseFloat(app.amount),
        currency: app.currency,
        duration: app.duration,
        interestRate: parseFloat(app.interest_rate),
        purpose: app.purpose,
        monthlyIncome: parseFloat(app.monthly_income),
        status: app.status,
        createdAt: app.created_at,
        reviewedAt: app.reviewed_at,
        reviewedBy: app.reviewed_by
      }));
    } catch (error) {
      logger.error('Error fetching loan applications by user ID', error as Error);
      throw error;
    }
  },

  async create(application: Omit<LoanApplication, 'id' | 'createdAt'>): Promise<LoanApplication> {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .insert([{
          user_id: application.userId,
          loan_type: application.loanType,
          amount: application.amount,
          currency: application.currency,
          duration: application.duration,
          interest_rate: application.interestRate,
          purpose: application.purpose,
          monthly_income: application.monthlyIncome,
          status: application.status
        }])
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        userId: data.user_id,
        loanType: data.loan_type,
        amount: parseFloat(data.amount),
        currency: data.currency,
        duration: data.duration,
        interestRate: parseFloat(data.interest_rate),
        purpose: data.purpose,
        monthlyIncome: parseFloat(data.monthly_income),
        status: data.status,
        createdAt: data.created_at,
        reviewedAt: data.reviewed_at,
        reviewedBy: data.reviewed_by
      };
    } catch (error) {
      logger.error('Error creating loan application', error as Error);
      throw error;
    }
  },

  async updateStatus(id: string, status: 'approved' | 'rejected', reviewedBy: string): Promise<LoanApplication> {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        userId: data.user_id,
        loanType: data.loan_type,
        amount: parseFloat(data.amount),
        currency: data.currency,
        duration: data.duration,
        interestRate: parseFloat(data.interest_rate),
        purpose: data.purpose,
        monthlyIncome: parseFloat(data.monthly_income),
        status: data.status,
        createdAt: data.created_at,
        reviewedAt: data.reviewed_at,
        reviewedBy: data.reviewed_by
      };
    } catch (error) {
      logger.error('Error updating loan application status', error as Error);
      throw error;
    }
  }
};

// Service pour les prêts
export const loanService = {
  async getByUserId(userId: string): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(loan => ({
        id: loan.id,
        applicationId: loan.application_id,
        userId: loan.user_id,
        amount: parseFloat(loan.amount),
        currency: loan.currency,
        interestRate: parseFloat(loan.interest_rate),
        duration: loan.duration,
        monthlyPayment: parseFloat(loan.monthly_payment),
        remainingBalance: parseFloat(loan.remaining_balance),
        nextPaymentDate: loan.next_payment_date,
        status: loan.status,
        createdAt: loan.created_at
      }));
    } catch (error) {
      logger.error('Error fetching loans by user ID', error as Error);
      throw error;
    }
  },

  async getAll(): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(loan => ({
        id: loan.id,
        applicationId: loan.application_id,
        userId: loan.user_id,
        amount: parseFloat(loan.amount),
        currency: loan.currency,
        interestRate: parseFloat(loan.interest_rate),
        duration: loan.duration,
        monthlyPayment: parseFloat(loan.monthly_payment),
        remainingBalance: parseFloat(loan.remaining_balance),
        nextPaymentDate: loan.next_payment_date,
        status: loan.status,
        createdAt: loan.created_at
      }));
    } catch (error) {
      logger.error('Error fetching all loans', error as Error);
      throw error;
    }
  },

  async create(loan: Omit<Loan, 'id' | 'createdAt'>): Promise<Loan> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert([{
          application_id: loan.applicationId,
          user_id: loan.userId,
          amount: loan.amount,
          currency: loan.currency,
          interest_rate: loan.interestRate,
          duration: loan.duration,
          monthly_payment: loan.monthlyPayment,
          remaining_balance: loan.remainingBalance,
          next_payment_date: loan.nextPaymentDate,
          status: loan.status
        }])
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        applicationId: data.application_id,
        userId: data.user_id,
        amount: parseFloat(data.amount),
        currency: data.currency,
        interestRate: parseFloat(data.interest_rate),
        duration: data.duration,
        monthlyPayment: parseFloat(data.monthly_payment),
        remainingBalance: parseFloat(data.remaining_balance),
        nextPaymentDate: data.next_payment_date,
        status: data.status,
        createdAt: data.created_at
      };
    } catch (error) {
      logger.error('Error creating loan', error as Error);
      throw error;
    }
  }
};