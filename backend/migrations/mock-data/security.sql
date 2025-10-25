-- Users
INSERT INTO security.user (email, passwd, "name", surname) VALUES
    ('user1@example.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$/Hazq7Q3XHij7uTVwTo/Zg', 'Nick', 'Wright'),
    ('user2@example.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$n4ZPbWf+7daRpgwvOrCEUA', 'Maya', 'Fey'),
    ('user3@example.com', '$argon2i$v=19$m=16,t=2,p=1$MTIzNDU2Nzg$q4AEYT6GZdMeIXZkkHKdsA', 'Miles', 'Edgeworth')
ON CONFLICT (email) DO NOTHING;

-- Profiles
INSERT INTO security.profile ("name") VALUES
    ('admin'),
    ('moderator'),
    ('user'),
    ('viewer'),
    ('guest')
ON CONFLICT ("name") DO NOTHING;

-- Assign profiles to users
INSERT INTO security.user_profile (user_id, profile_id)
    SELECT u.user_id, p.profile_id 
    FROM security.user u, security.profile p 
    WHERE (u.email, p.name) IN (
        ('user1@example.com', 'admin'),
        ('user1@example.com', 'user'),
        ('user2@example.com', 'moderator'),
        ('user2@example.com', 'viewer'),
        ('user3@example.com', 'user'),
        ('user3@example.com', 'guest')
    )
ON CONFLICT DO NOTHING;

-- Subsystems
INSERT INTO security.subsystem ("name") VALUES
    ('users'),
    ('billing'),
    ('reports')
ON CONFLICT ("name") DO NOTHING;

-- Classes: Links Subsystem ID + Class Name
INSERT INTO security.class (subsystem_id, "name")
    SELECT s.subsystem_id, c.class_name
    FROM security.subsystem s
    CROSS JOIN (VALUES
        ('users', 'management'),        -- Subsystem: Users
        ('users', 'permissions'),
        ('billing', 'invoices'),        -- Subsystem: Billing
        ('billing', 'payments'),
        ('reports', 'general')          -- Subsystem: Reports
    ) AS c (subsystem_name, class_name)
    WHERE s.name = c.subsystem_name
ON CONFLICT (subsystem_id, "name") DO NOTHING;

-- Methods: Links Class ID + Method Name
INSERT INTO security.method (class_id, "name")
    SELECT c.class_id, m.method_name
    FROM security.class c
    INNER JOIN security.subsystem s ON c.subsystem_id = s.subsystem_id
    CROSS JOIN (VALUES
        -- Users.Management Methods
        ('users', 'management', 'create'),
        ('users', 'management', 'read'),
        ('users', 'management', 'update'),
        ('users', 'management', 'delete'),
        -- Users.Permissions Methods
        ('users', 'permissions', 'assign'),
        -- Billing.Invoices Methods
        ('billing', 'invoices', 'view'),
        ('billing', 'invoices', 'download'),
        -- Reports.General Methods
        ('reports', 'general', 'generate'),
        ('reports', 'general', 'unused')
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
        -- Subsystem: Users
        ('users', 'User Management'),
        ('users', 'Permissions Console'),
        ('users', 'Guest Landing Page'),
        -- Subsystem: Billing
        ('billing', 'View Invoices'),
        ('billing', 'Payment History'),
        -- Subsystem: Reports
        ('reports', 'System Reports')
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
        -- Admin: Full CRUD on User Management
        ('users', 'management', 'create', 'admin'),
        ('users', 'management', 'read', 'admin'),
        ('users', 'management', 'update', 'admin'),
        ('users', 'management', 'delete', 'admin'),
        -- Admin: Can Assign Permissions
        ('users', 'permissions', 'assign', 'admin'),
        -- Moderator: Can Read/Update Users, View Invoices
        ('users', 'management', 'read', 'moderator'),
        ('users', 'management', 'update', 'moderator'),
        ('billing', 'invoices', 'view', 'moderator'),
        -- User: Can Read Users, View/Download Invoices, Generate Reports
        ('users', 'management', 'read', 'user'),
        ('billing', 'invoices', 'view', 'user'),
        ('billing', 'invoices', 'download', 'user'),
        ('reports', 'general', 'generate', 'user'),
        -- Viewer: Can only View Invoices
        ('billing', 'invoices', 'view', 'viewer'),
        -- Guest: Can only Read Users
        ('users', 'management', 'read', 'guest')
    )
ON CONFLICT DO NOTHING;

-- Menu-Profile Link (What profiles can see what menus)
INSERT INTO security.menu_profile (menu_id, profile_id)
    SELECT me.menu_id, p.profile_id
    FROM security.menu me, security.profile p
    WHERE (me.name, p.name) IN (
        -- Admin sees everything
        ('User Management', 'admin'),
        ('Permissions Console', 'admin'),
        ('View Invoices', 'admin'),
        ('Payment History', 'admin'),
        ('System Reports', 'admin'),
        -- Moderator sees a subset
        ('User Management', 'moderator'),
        ('View Invoices', 'moderator'),
        ('Payment History', 'moderator'),
        ('System Reports', 'moderator'),
        -- User sees a standard set
        ('View Invoices', 'user'),
        ('Payment History', 'user'),
        ('System Reports', 'user'),
        -- Viewer sees minimal
        ('View Invoices', 'viewer'),
        -- Guest sees only the landing page
        ('Guest Landing Page', 'guest')
    )
ON CONFLICT DO NOTHING;