-- PG admission applications, administrators and their sessions.

-- One counter per year, so application numbers restart at 00001 each year: LBCPG-2026-00001.
CREATE TABLE application_counters (
  year integer PRIMARY KEY,
  last integer NOT NULL
);

CREATE TABLE applications (
  id              bigserial PRIMARY KEY,
  app_no          text NOT NULL UNIQUE,
  -- sha256 of the secret the applicant's browser holds; lets them update their own application
  edit_token_hash text NOT NULL,
  status          text NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted', 'under_review', 'admitted', 'rejected')),
  -- columns the dashboard lists, filters and searches on
  course          text NOT NULL,
  name            text NOT NULL,
  email           text NOT NULL,
  phone           text NOT NULL,
  category        text NOT NULL,
  local_status    text NOT NULL,
  -- the full form as submitted (everything except the photo)
  data            jsonb NOT NULL,
  photo           bytea,
  admin_notes     text NOT NULL DEFAULT '',
  revision        integer NOT NULL DEFAULT 1,
  submitted_at    timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  status_changed_at timestamptz,
  status_changed_by text
);
CREATE INDEX applications_status_idx ON applications (status);
CREATE INDEX applications_course_idx ON applications (course);
CREATE INDEX applications_submitted_idx ON applications (submitted_at DESC);
CREATE INDEX applications_name_idx ON applications (lower(name));

CREATE TABLE admins (
  id            serial PRIMARY KEY,
  username      text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

CREATE TABLE admin_sessions (
  token_hash text PRIMARY KEY,
  admin_id   integer NOT NULL REFERENCES admins (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX admin_sessions_expires_idx ON admin_sessions (expires_at);
