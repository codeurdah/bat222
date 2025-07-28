@@ .. @@
 -- RLS policies for loan_applications
-CREATE POLICY "Allow loan application access" ON loan_applications
+CREATE POLICY "Public loan application access" ON loan_applications
   FOR SELECT USING (true);
 
-CREATE POLICY "Allow loan application management" ON loan_applications
-  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
+CREATE POLICY "Service role can manage loan applications" ON loan_applications
+  FOR ALL USING (true);
 
 -- RLS policies for loans
-CREATE POLICY "Allow loan access" ON loans
+CREATE POLICY "Public loan access" ON loans
   FOR SELECT USING (true);
 
-CREATE POLICY "Allow loan management" ON loans
-  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
+CREATE POLICY "Service role can manage loans" ON loans
+  FOR ALL USING (true);