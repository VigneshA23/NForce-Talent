UPDATE members SET active = 0, auth_id = NULL WHERE role NOT IN ('hr', 'admin');
