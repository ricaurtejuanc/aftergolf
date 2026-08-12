-- Adds the PCC (Playing Conditions Calculation) adjustment to rounds.
-- Run this once in the Supabase SQL Editor if the rounds table already
-- existed before this migration (schema.sql already has it for fresh setups).

alter table public.rounds add column if not exists pcc numeric not null default 0;
