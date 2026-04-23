-- BotLab Multi-Tenant Schema

-- Projects (one per client bot)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_format TEXT DEFAULT 'ycloud'
    CHECK (webhook_format IN ('ycloud', 'evolution', 'custom')),
  agent_phone_number TEXT DEFAULT '',
  test_phone_numbers JSONB DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client'
    CHECK (role IN ('admin', 'client')),
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  simulated_phone_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  bot_status TEXT DEFAULT 'active'
    CHECK (bot_status IN ('active', 'deactivated')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('customer', 'bot', 'agent')),
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'audio')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'sending'
    CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Annotations (feedback from clients)
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('minor', 'medium', 'critical')),
  note TEXT NOT NULL,
  suggestion TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_project ON conversations(project_id);
CREATE INDEX idx_conversations_user ON conversations(user_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_annotations_conversation ON annotations(conversation_id);
CREATE INDEX idx_annotations_user ON annotations(user_id);
CREATE INDEX idx_annotations_created ON annotations(created_at DESC);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles
CREATE POLICY "Users see own profile" ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());
CREATE POLICY "Admin manages profiles" ON profiles FOR ALL
  USING (is_admin());
-- Clients can only update their own name. Role and project_id changes require admin.
CREATE POLICY "Users update own name" ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND project_id IS NOT DISTINCT FROM (SELECT project_id FROM profiles WHERE id = auth.uid())
  );

-- Projects
CREATE POLICY "Client sees assigned project" ON projects FOR SELECT
  USING (
    id IN (SELECT project_id FROM profiles WHERE id = auth.uid())
    OR is_admin()
  );
CREATE POLICY "Admin manages projects" ON projects FOR INSERT
  WITH CHECK (is_admin());
CREATE POLICY "Admin updates projects" ON projects FOR UPDATE
  USING (is_admin());
CREATE POLICY "Admin deletes projects" ON projects FOR DELETE
  USING (is_admin());

-- Conversations
CREATE POLICY "Own conversations select" ON conversations FOR SELECT
  USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Create own conversations" ON conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Update own conversations" ON conversations FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Delete own conversations" ON conversations FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

-- Messages
CREATE POLICY "Messages via conversation" ON messages FOR SELECT
  USING (
    conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
    OR is_admin()
  );
CREATE POLICY "Insert messages" ON messages FOR INSERT
  WITH CHECK (
    conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
  );
CREATE POLICY "Update own messages" ON messages FOR UPDATE
  USING (
    conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())
    OR is_admin()
  );

-- Annotations
CREATE POLICY "Own annotations select" ON annotations FOR SELECT
  USING (user_id = auth.uid() OR is_admin());
CREATE POLICY "Create annotations" ON annotations FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Delete own annotations" ON annotations FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

-- ============================================
-- Auto-create profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'client'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Enable Realtime for annotations
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE annotations;

-- ============================================
-- Grant access for GoTrue (supabase_auth_admin)
-- ============================================

GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
