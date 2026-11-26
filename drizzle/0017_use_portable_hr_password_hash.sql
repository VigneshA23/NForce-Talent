UPDATE portal_credentials
SET password_hash='pbkdf2:sha256:310000:d22e3fe147d24a7a761009a6c6e4d6ea:bf356272bf1ab7792e05375ae8bfc3c4610fa952ba2ce7e420c8002c7d4af440',
    recovery_hash='d7f41823ebf2aa16cfe81577f9725298e39ff5d72e50d4d9c3adcd36726fc569',
    version=version+1,
    temporary=0,
    temporary_expires_at=NULL,
    updated_at=CAST(strftime('%s','now') AS INTEGER)*1000
WHERE member_id IN (
  SELECT id FROM members WHERE lower(email)='hr@nforceone.com'
);
--> statement-breakpoint
DELETE FROM portal_sessions
WHERE member_id IN (
  SELECT id FROM members WHERE lower(email)='hr@nforceone.com'
);
--> statement-breakpoint
DELETE FROM password_resets
WHERE member_id IN (
  SELECT id FROM members WHERE lower(email)='hr@nforceone.com'
);
--> statement-breakpoint
DELETE FROM auth_limits
WHERE key IN (
  SELECT id || ':password' FROM members WHERE lower(email)='hr@nforceone.com'
);
