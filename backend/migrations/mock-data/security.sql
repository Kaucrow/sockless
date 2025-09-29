-- Users
INSERT INTO security.user (email, passwd, "name", surname) VALUES
    ('user1@example.com', 'hashed_password_1', 'Nick', 'Wright'),
    ('user2@example.com', 'hashed_password_2', 'Maya', 'Fey'),
    ('user3@example.com', 'hashed_password_3', 'Miles', 'Edgeworth')
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
    ('Users'),
    ('Billing'),
    ('Reports')
ON CONFLICT ("name") DO NOTHING;

-- Classes: Links Subsystem ID + Class Name
INSERT INTO security.class (subsystem_id, "name")
    SELECT s.subsystem_id, c.class_name
    FROM security.subsystem s
    CROSS JOIN (VALUES
        ('Users', 'Management'),        -- Subsystem: Users
        ('Users', 'Permissions'),
        ('Billing', 'Invoices'),        -- Subsystem: Billing
        ('Billing', 'Payments'),
        ('Reports', 'General')          -- Subsystem: Reports
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
        ('Users', 'Management', 'create'),
        ('Users', 'Management', 'read'),
        ('Users', 'Management', 'update'),
        ('Users', 'Management', 'delete'),
        -- Users.Permissions Methods
        ('Users', 'Permissions', 'assign'),
        -- Billing.Invoices Methods
        ('Billing', 'Invoices', 'view'),
        ('Billing', 'Invoices', 'download'),
        -- Reports.General Methods
        ('Reports', 'General', 'generate')
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
        ('Users', 'User Management'),
        ('Users', 'Permissions Console'),
        ('Users', 'Guest Landing Page'),
        -- Subsystem: Billing
        ('Billing', 'View Invoices'),
        ('Billing', 'Payment History'),
        -- Subsystem: Reports
        ('Reports', 'System Reports')
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
        ('Users', 'Management', 'create', 'admin'),
        ('Users', 'Management', 'read', 'admin'),
        ('Users', 'Management', 'update', 'admin'),
        ('Users', 'Management', 'delete', 'admin'),
        -- Admin: Can Assign Permissions
        ('Users', 'Permissions', 'assign', 'admin'),
        -- Moderator: Can Read/Update Users, View Invoices
        ('Users', 'Management', 'read', 'moderator'),
        ('Users', 'Management', 'update', 'moderator'),
        ('Billing', 'Invoices', 'view', 'moderator'),
        -- User: Can Read Users, View/Download Invoices, Generate Reports
        ('Users', 'Management', 'read', 'user'),
        ('Billing', 'Invoices', 'view', 'user'),
        ('Billing', 'Invoices', 'download', 'user'),
        ('Reports', 'General', 'generate', 'user'),
        -- Viewer: Can only View Invoices
        ('Billing', 'Invoices', 'view', 'viewer'),
        -- Guest: Can only Read Users
        ('Users', 'Management', 'read', 'guest')
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