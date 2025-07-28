/*
  # Données initiales pour Banque Atlantique

  1. Utilisateurs de test
    - Administrateur système
    - Clients de démonstration

  2. Comptes et transactions de base
*/

-- Insérer l'utilisateur admin (mot de passe: admin1237575@@xyz)
-- Note: En production, utilisez un hash sécurisé
INSERT INTO users (id, username, password_hash, role, first_name, last_name, email, phone, address) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin', '$2b$10$rQZ8kHp.TB.It.NvHLvQKOYpDJkz8Qx5YzQx5YzQx5YzQx5YzQx5Y', 'admin', 'Admin', 'System', 'admin@banqueatlantique.com', '+228-XX-XX-XX-XX', 'Lomé, TOGO')
ON CONFLICT (username) DO NOTHING;

-- Insérer des clients de test
INSERT INTO users (id, username, password_hash, role, first_name, last_name, email, phone, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'client1', '$2b$10$rQZ8kHp.TB.It.NvHLvQKOclient123hash', 'client', 'Jean', 'Dupont', 'jean.dupont@email.com', '+228-90-12-34-56', 'Lomé Bè, TOGO'),
('550e8400-e29b-41d4-a716-446655440002', 'client2', '$2b$10$rQZ8kHp.TB.It.NvHLvQKOclient123hash', 'client', 'Marie', 'Martin', 'marie.martin@email.com', '+228-91-23-45-67', 'Kara, TOGO')
ON CONFLICT (username) DO NOTHING;

-- Insérer des comptes
INSERT INTO accounts (id, user_id, account_number, account_type, balance, currency, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'TG53TG138010000000000001', 'savings', 15000.00, 'EUR', 'active'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'TG53TG138010000000000002', 'current', 3500.00, 'EUR', 'active'),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'TG53TG138010000000000003', 'savings', 8750.00, 'EUR', 'active')
ON CONFLICT (account_number) DO NOTHING;

-- Insérer des transactions de test
INSERT INTO transactions (id, from_account_id, to_account_id, amount, currency, type, description, status) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 500.00, 'EUR', 'transfer', 'Virement interne', 'completed'),
('770e8400-e29b-41d4-a716-446655440002', NULL, '660e8400-e29b-41d4-a716-446655440001', 2000.00, 'EUR', 'deposit', 'Dépôt initial', 'completed'),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', NULL, 1250.00, 'EUR', 'withdrawal', 'Retrait ATM', 'completed')
ON CONFLICT (id) DO NOTHING;

-- Insérer des demandes de crédit de test
INSERT INTO loan_applications (id, user_id, loan_type, amount, currency, duration, interest_rate, purpose, monthly_income, status) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'personal', 10000.00, 'EUR', 24, 5.5, 'Rénovation domicile', 3500.00, 'pending'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'investment', 25000.00, 'EUR', 36, 4.8, 'Expansion commerce', 5200.00, 'approved')
ON CONFLICT (id) DO NOTHING;

-- Insérer un prêt actif
INSERT INTO loans (id, application_id, user_id, amount, currency, interest_rate, duration, monthly_payment, remaining_balance, next_payment_date, status) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 25000.00, 'EUR', 4.8, 36, 742.50, 23500.00, '2024-12-15T00:00:00Z', 'active')
ON CONFLICT (id) DO NOTHING;