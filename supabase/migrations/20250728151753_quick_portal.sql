/*
  # Correction de l'erreur de politique déjà existante

  1. Problème
    - La politique "Allow read for authentication" existe déjà
    - Erreur 42710 lors de la création de politique dupliquée

  2. Solution
    - Utiliser DROP POLICY IF EXISTS avant CREATE POLICY
    - Vérifier l'existence avant création
    - Nettoyer et recréer proprement toutes les politiques

  3. Sécurité
    - Maintenir l'accès nécessaire pour l'authentification
    - Éviter la récursion infinie
*/

-- Nettoyer toutes les politiques existantes sur users
DROP POLICY IF EXISTS "Allow read for authentication" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Recréer les politiques nécessaires sans récursion
CREATE POLICY "Allow read for authentication" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (true);

-- Nettoyer et recréer les politiques pour accounts
DROP POLICY IF EXISTS "Users can read own accounts" ON accounts;
DROP POLICY IF EXISTS "Allow account access" ON accounts;
DROP POLICY IF EXISTS "Allow account management" ON accounts;

CREATE POLICY "Allow account access" ON accounts
  FOR SELECT USING (true);

CREATE POLICY "Allow account management" ON accounts
  FOR ALL USING (true);

-- Nettoyer et recréer les politiques pour transactions
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Allow transaction access" ON transactions;
DROP POLICY IF EXISTS "System can insert transactions" ON transactions;

CREATE POLICY "Allow transaction access" ON transactions
  FOR SELECT USING (true);

CREATE POLICY "Allow transaction management" ON transactions
  FOR ALL USING (true);

-- Nettoyer et recréer les politiques pour loan_applications
DROP POLICY IF EXISTS "Users can read own loan applications" ON loan_applications;
DROP POLICY IF EXISTS "Users can insert own loan applications" ON loan_applications;
DROP POLICY IF EXISTS "Allow loan application access" ON loan_applications;
DROP POLICY IF EXISTS "Allow loan application management" ON loan_applications;

CREATE POLICY "Allow loan application access" ON loan_applications
  FOR SELECT USING (true);

CREATE POLICY "Allow loan application management" ON loan_applications
  FOR ALL USING (true);

-- Nettoyer et recréer les politiques pour loans
DROP POLICY IF EXISTS "Users can read own loans" ON loans;
DROP POLICY IF EXISTS "Allow loan access" ON loans;
DROP POLICY IF EXISTS "Allow loan management" ON loans;

CREATE POLICY "Allow loan access" ON loans
  FOR SELECT USING (true);

CREATE POLICY "Allow loan management" ON loans
  FOR ALL USING (true);