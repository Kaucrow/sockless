-- Users
INSERT INTO security.user (email, passwd, "name", surname) VALUES
    ('user1@example.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$/Hazq7Q3XHij7uTVwTo/Zg', 'Nick', 'Wright'),
    ('user2@example.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$n4ZPbWf+7daRpgwvOrCEUA', 'Maya', 'Fey'),
    ('user3@example.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$q4AEYT6GZdMeIXZkkHKdsA', 'Miles', 'Edgeworth')
ON CONFLICT (email) DO NOTHING;

-- Profiles
INSERT INTO security.profile ("name") VALUES
    ('event-admin')
ON CONFLICT ("name") DO NOTHING;

-- Assign profiles to users
INSERT INTO security.user_profile (user_id, profile_id)
    SELECT u.user_id, p.profile_id 
    FROM security.user u, security.profile p 
    WHERE (u.email, p.name) IN (
        ('user1@example.com', 'event-admin')
    )
ON CONFLICT DO NOTHING;

-- Subsystems
INSERT INTO security.subsystem ("name") VALUES
    ('events')
ON CONFLICT ("name") DO NOTHING;

-- Classes: Links Subsystem ID + Class Name
INSERT INTO security.class (subsystem_id, "name")
    SELECT s.subsystem_id, c.class_name
    FROM security.subsystem s
    CROSS JOIN (VALUES
        ('events', 'event')
    ) AS c (subsystem_name, class_name)
    WHERE s.name = c.subsystem_name
ON CONFLICT (subsystem_id, "name") DO NOTHING;

-- Methods: Links Class ID + Method Name
INSERT INTO security.method (class_id, "name")
    SELECT c.class_id, m.method_name
    FROM security.class c
    INNER JOIN security.subsystem s ON c.subsystem_id = s.subsystem_id
    CROSS JOIN (VALUES
        ('events', 'event', 'createEvent')
    ) AS m (subsystem_name, class_name, method_name)
    WHERE s.name = m.subsystem_name
      AND c.name = m.class_name
ON CONFLICT (class_id, "name") DO NOTHING;

-- Insert all unique Subsystem, Class, and Method combinations 
-- from the existing security tables into the tx table
INSERT INTO security.tx (subsystem, class, method)
SELECT DISTINCT
    s.name AS subsystem,
    c.name AS class,
    m.name AS method
FROM
    security.subsystem AS s
JOIN
    security.class AS c ON s.subsystem_id = c.subsystem_id
JOIN
    security.method AS m ON c.class_id = m.class_id
ON CONFLICT (subsystem, class, method) DO NOTHING;

-- Menu Items
INSERT INTO security.menu (subsystem_id, "name")
    SELECT s.subsystem_id, m.menu_name
    FROM security.subsystem s
    CROSS JOIN (VALUES
        -- Subsystem: Events
        ('events', 'User Management')
    ) AS m (subsystem_name, menu_name)
    WHERE s.name = m.subsystem_name
ON CONFLICT (subsystem_id, "name") DO NOTHING;

-- Method-Profile Link (What profiles can execute which methods)
INSERT INTO security.method_profile (method_id, profile_id)
    SELECT m.method_id, p.profile_id
    FROM security.method m
    JOIN security.class c ON m.class_id = c.class_id
    JOIN security.subsystem s ON c.subsystem_id = s.subsystem_id
    JOIN security.profile p ON TRUE
    WHERE (s.name, c.name, m.name, p.name) IN (
        ('events', 'event', 'createEvent', 'event-admin')
    )
ON CONFLICT DO NOTHING;

-- Menu-Profile Link (What profiles can see what menus)
INSERT INTO security.menu_profile (menu_id, profile_id)
    SELECT me.menu_id, p.profile_id
    FROM security.menu me, security.profile p
    WHERE (me.name, p.name) IN (
        ('User Management', 'event-admin')
    )
ON CONFLICT DO NOTHING;