UPDATE portal_credentials
SET password_hash='scrypt:16384:8:5:ba3d6d03bf3a4ef43535d766dfd52725:2ccf330b148a7d0885184d54404a48a6ed70e14e6e6c35644216299c8439b72c',
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
WHERE key LIKE 'login:%hr@nforceone.com%';
