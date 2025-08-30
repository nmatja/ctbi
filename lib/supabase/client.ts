import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    "https://evchwthsvmforddzdkef.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2Y2h3dGhzdm1mb3JkZHpka2VmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1NjM3OTQsImV4cCI6MjA3MjEzOTc5NH0.Dqe7D82NYZBlpSZX2b5TScMJzcyfQzZoXfsTZSO0De8", // Added the provided Supabase anonymous key
  )
}
