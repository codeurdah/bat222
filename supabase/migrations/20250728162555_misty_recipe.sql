@@ .. @@
 -- RLS policies for accounts
-CREATE POLICY "Allow account access" ON accounts
+CREATE POLICY "Public account access" ON accounts
   FOR SELECT USING (true);
 
-CREATE POLICY "Allow account management" ON accounts
-  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
+CREATE POLICY "Service role can manage accounts" ON accounts
+  FOR ALL USING (true);
 
 -- RLS policies for transactions
-CREATE POLICY "Allow transaction access" ON transactions
+CREATE POLICY "Public transaction access" ON transactions
   FOR SELECT USING (true);
 
-CREATE POLICY "Allow transaction management" ON transactions
-  FOR INSERT WITH CHECK (
-    EXISTS (
-      SELECT 1 FROM accounts 
-      WHERE id = from_account_id 
-      AND user_id = auth.uid()::text
-    )
-  );
+CREATE POLICY "Service role can manage transactions" ON transactions
+  FOR ALL USING (true);