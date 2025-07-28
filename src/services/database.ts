import { supabase } from '../lib/supabase';
import { User, Account, Transaction, LoanApplication, Loan } from '../types';
import { logger } from '../utils/logger';

// Service pour les utilisateurs
export const userService = {
  async getAll(): Promise<User[]> {
    try {
      console.log('🔍 Tentative de récupération de tous les utilisateurs...');
      
      // Utiliser le service role pour contourner RLS
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error && error.code === '42883') {
        // Si la fonction n'existe pas, utiliser la méthode normale
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          console.error('❌ Erreur Supabase lors de la récupération des utilisateurs:', fallbackError);
          throw fallbackError;
        }
        console.log('✅ Utilisateurs récupérés avec succès (fallback):', fallbackData?.length || 0);
        return (fallbackData || []).map(this.mapUserFromDb);
      }

      if (error) {
        console.error('❌ Erreur Supabase lors de la récupération des utilisateurs:', error);
        throw error;
      }
      console.log('✅ Utilisateurs récupérés avec succès:', data?.length || 0);
      return (data || []).map(this.mapUserFromDb);
    } catch (error) {
      logger.error('Error fetching users', error as Error);
      throw error;
    }
  },

  mapUserFromDb(dbUser: any): User {
    return {
      id: dbUser.id,
      username: dbUser.username,
      password: dbUser.password_hash || dbUser.password,
      role: dbUser.role,
      firstName: dbUser.first_name || dbUser.firstName,
      lastName: dbUser.last_name || dbUser.lastName,
      email: dbUser.email,
      phone: dbUser.phone,
      address: dbUser.address,
      createdAt: dbUser.created_at || dbUser.createdAt
    };
  },

  async getById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data ? this.mapUserFromDb(data) : null;
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
      return data ? this.mapUserFromDb(data) : null;
    } catch (error) {
      logger.error('Error fetching user by username', error as Error);
      return null;
    }
  },

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      console.log('🔍 Tentative de création d\'utilisateur avec contournement RLS...');
      
      console.log('🔍 Tentative de création d\'utilisateur:', {
        username: user.username,
        email: user.email,
        role: user.role
      });
      
      // Essayer d'abord avec une fonction RPC qui contourne RLS
      let data, error;
      
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_admin', {
          p_username: user.username,
          p_password_hash: user.password,
          p_role: user.role,
          p_first_name: user.firstName,
          p_last_name: user.lastName,
          p_email: user.email,
          p_phone: user.phone,
          p_address: user.address
        });
        
        if (rpcError && rpcError.code !== '42883') {
          throw rpcError;
        }
        
        if (!rpcError) {
          data = rpcData;
          error = null;
        } else {
          throw new Error('RPC function not available');
        }
      } catch (rpcErr) {
        console.log('🔄 RPC non disponible, utilisation de la méthode directe...');
        
        // Fallback vers insertion directe
        const { data: insertData, error: insertError } = await supabase
          .from('users')
          .insert([{
            username: user.username,
            password_hash: user.password,
            role: user.role,
            first_name: user.firstName,
            last_name: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address
          }])
        .select()
        .single();
        
        data = insertData;
        error = insertError;
      }

      if (error) {
        console.error('❌ Erreur Supabase lors de la création d\'utilisateur:', error);
        console.error('Code d\'erreur:', error.code);
        console.error('Message:', error.message);
        console.error('Détails:', error.details);
        throw error;
      }
      
      console.log('✅ Utilisateur créé avec succès:', data);
      return this.mapUserFromDb(data);
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
  },

  async updateStatus(id: string, status: 'pending' | 'completed' | 'failed'): Promise<Transaction> {
    try {
      // Si la transaction est validée, mettre à jour les soldes des comptes
      if (status === 'completed') {
        const transaction = await this.getById(id);
        if (transaction) {
          await this.updateAccountBalances(transaction);
        }
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id)
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
      logger.error('Error updating transaction status', error as Error);
      throw error;
    }
  },

  async getById(id: string): Promise<Transaction | null> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? {
        id: data.id,
        fromAccountId: data.from_account_id,
        toAccountId: data.to_account_id,
        amount: parseFloat(data.amount),
        currency: data.currency,
        type: data.type,
        description: data.description,
        status: data.status,
        createdAt: data.created_at
      } : null;
    } catch (error) {
      logger.error('Error fetching transaction by ID', error as Error);
      return null;
    }
  },

  async updateAccountBalances(transaction: Transaction): Promise<void> {
    try {
      // Mettre à jour le compte émetteur (débit)
      if (transaction.fromAccountId) {
        const { error: fromError } = await supabase.rpc('update_account_balance', {
          account_id: transaction.fromAccountId,
          amount: -transaction.amount,
          transaction_type: 'debit'
        });
        
        if (fromError) {
          // Fallback: mise à jour directe si la fonction RPC n'existe pas
          const { data: fromAccount } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', transaction.fromAccountId)
            .single();
            
          if (fromAccount) {
            await supabase
              .from('accounts')
              .update({ balance: parseFloat(fromAccount.balance) - transaction.amount })
              .eq('id', transaction.fromAccountId);
          }
        }
      }

      // Mettre à jour le compte bénéficiaire (crédit)
      if (transaction.toAccountId) {
        const { error: toError } = await supabase.rpc('update_account_balance', {
          account_id: transaction.toAccountId,
          amount: transaction.amount,
          transaction_type: 'credit'
        });
        
        if (toError) {
          // Fallback: mise à jour directe si la fonction RPC n'existe pas
          const { data: toAccount } = await supabase
            .from('accounts')
            .select('balance')
            .eq('id', transaction.toAccountId)
            .single();
            
          if (toAccount) {
            await supabase
              .from('accounts')
              .update({ balance: parseFloat(toAccount.balance) + transaction.amount })
              .eq('id', transaction.toAccountId);
          }
        }
      }

      // Pour les dépôts (pas de compte émetteur)
      if (transaction.type === 'deposit' && transaction.toAccountId) {
        const { data: account } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', transaction.toAccountId)
          .single();
          
        if (account) {
          await supabase
            .from('accounts')
            .update({ balance: parseFloat(account.balance) + transaction.amount })
            .eq('id', transaction.toAccountId);
        }
      }

      // Pour les retraits (pas de compte bénéficiaire)
      if (transaction.type === 'withdrawal' && transaction.fromAccountId) {
        const { data: account } = await supabase
          .from('accounts')
          .select('balance')
          .eq('id', transaction.fromAccountId)
          .single();
          
        if (account) {
          await supabase
            .from('accounts')
            .update({ balance: parseFloat(account.balance) - transaction.amount })
            .eq('id', transaction.fromAccountId);
        }
      }

      logger.info('Account balances updated successfully', { transactionId: transaction.id });
    } catch (error) {
      logger.error('Error updating account balances', error as Error);
      throw error;
    }
  },

  async updateStatusWithReason(id: string, status: 'failed', reason: string): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status,
          description: `${data?.description || ''} - REJETÉ: ${reason}`
        })
        .eq('id', id)
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
      logger.error('Error updating transaction status with reason', error as Error);
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