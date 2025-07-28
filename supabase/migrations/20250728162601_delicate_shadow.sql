@@ .. @@
   password VARCHAR(255) NOT NULL DEFAULT 'client123'
 );
 
+-- Fonction RPC pour créer un utilisateur (contourne RLS)
+CREATE OR REPLACE FUNCTION create_user_admin(
+  p_username text,
+  p_password_hash text,
+  p_role text,
+  p_first_name text,
+  p_last_name text,
+  p_email text,
+  p_phone text,
+  p_address text
+)
+RETURNS users
+LANGUAGE plpgsql
+SECURITY DEFINER
+AS $$
+DECLARE
+  new_user users;
+BEGIN
+  -- Insérer le nouvel utilisateur
+  INSERT INTO users (
+    username,
+    password_hash,
+    role,
+    first_name,
+    last_name,
+    email,
+    phone,
+    address
+  ) VALUES (
+    p_username,
+    p_password_hash,
+    p_role,
+    p_first_name,
+    p_last_name,
+    p_email,
+    p_phone,
+    p_address
+  )
+  RETURNING * INTO new_user;
+  
+  RETURN new_user;
+END;
+$$;
+
+-- Fonction RPC pour récupérer tous les utilisateurs (contourne RLS)
+CREATE OR REPLACE FUNCTION get_all_users()
+RETURNS SETOF users
+LANGUAGE plpgsql
+SECURITY DEFINER
+AS $$
+BEGIN
+  RETURN QUERY SELECT * FROM users ORDER BY created_at DESC;
+END;
+$$;
+
+-- Accorder les permissions nécessaires
+GRANT EXECUTE ON FUNCTION create_user_admin TO anon, authenticated;
+GRANT EXECUTE ON FUNCTION get_all_users TO anon, authenticated;
+
 -- Insert sample accounts
 INSERT INTO accounts (user_id, account_number, account_type, balance, currency, status) VALUES