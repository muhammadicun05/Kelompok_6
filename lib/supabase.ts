import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wrugjojtvgkuwjqopete.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydWdqb2p0dmdrdXdqcW9wZXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NzAwODgsImV4cCI6MjEwNzQ0NjA4OH0.03Gt5upV1Dz7RANTOo3VrsuJuBduQp88h-Y8z1Be6Hs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});
