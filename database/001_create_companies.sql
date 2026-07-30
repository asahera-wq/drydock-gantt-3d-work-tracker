-- =====================================================
-- Drydock Gantt-to-3D Work Tracker
-- Database Version: 1.0
-- Migration: 001_create_companies.sql
-- =====================================================

create extension if not exists pgcrypto;

create table if not exists companies (
    id uuid primary key default gen_random_uuid(),

    name varchar(150) not null,

    short_name varchar(30),

    country varchar(100),

    website varchar(255),

    email varchar(150),

    phone varchar(50),

    logo_url text,

    is_active boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index if not exists idx_companies_name
on companies(name);
