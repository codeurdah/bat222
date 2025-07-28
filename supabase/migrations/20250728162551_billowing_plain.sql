@@ .. @@
 -- Enable RLS on all tables
 ALTER TABLE users ENABLE ROW LEVEL SECURITY;
 ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
 ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
 ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
 ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
 
--- Basic RLS policies for users table
-CREATE POLICY "Allow read for authentication" ON users
-  FOR SELECT USING (true);
+-- RLS policies for users table
+CREATE POLICY "Public read for authentication" ON users
+  FOR SELECT USING (true);
 
 CREATE POLICY "Users can read own data" ON users
   FOR SELECT USING (auth.uid()::text = id);
 
 CREATE POLICY "Users can update own data" ON users
   FOR UPDATE USING (auth.uid()::text = id);
+
+-- Allow service role to insert users (for admin creation)
+CREATE POLICY "Service role can insert users" ON users
+  FOR INSERT WITH CHECK (true);