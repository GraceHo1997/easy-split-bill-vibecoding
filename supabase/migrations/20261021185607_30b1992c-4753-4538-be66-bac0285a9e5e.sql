CREATE TABLE public.bill_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bill_sessions TO anon, authenticated;
GRANT ALL ON public.bill_sessions TO service_role;
ALTER TABLE public.bill_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view sessions" ON public.bill_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can create sessions" ON public.bill_sessions FOR INSERT WITH CHECK (true);

CREATE TABLE public.bill_selections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.bill_sessions(id) ON DELETE CASCADE,
  participant_id text NOT NULL,
  participant_name text NOT NULL,
  item_index int NOT NULL,
  share_count int NOT NULL DEFAULT 1,
  my_portions int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, participant_id, item_index)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bill_selections TO anon, authenticated;
GRANT ALL ON public.bill_selections TO service_role;
ALTER TABLE public.bill_selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view selections" ON public.bill_selections FOR SELECT USING (true);
CREATE POLICY "Anyone can add selections" ON public.bill_selections FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update selections" ON public.bill_selections FOR UPDATE USING (true);
CREATE POLICY "Anyone can remove selections" ON public.bill_selections FOR DELETE USING (true);
ALTER TABLE public.bill_selections REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bill_selections;