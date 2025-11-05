--- Table: security.user
CREATE TABLE IF NOT EXISTS security.user (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(50) UNIQUE NOT NULL,
    passwd TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL
);

--- Table: security.profile
CREATE TABLE IF NOT EXISTS security.profile (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) UNIQUE NOT NULL
);

--- Table: security.subsystem
CREATE TABLE IF NOT EXISTS security.subsystem (
    subsystem_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(50) UNIQUE NOT NULL
);

--- Table: security.class
CREATE TABLE IF NOT EXISTS security.class (
    class_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subsystem_id UUID NOT NULL
    "name" VARCHAR(50) NOT NULL,
    UNIQUE (subsystem_id, "name"),
    FOREIGN KEY (subsystem_id) REFERENCES (security.subsystem_id)
);

--- Table: security.method
CREATE TABLE IF NOT EXISTS security.method (
    method_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    UNIQUE (class_id, "name"),
    FOREIGN KEY (class_id) REFERENCES (security.class)
);

--- Table: security.menu
CREATE TABLE IF NOT EXISTS security.menu (
    menu_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subsystem_id UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    UNIQUE (subsystem_id, "name"),
    FOREIGN KEY (subsystem_id)
);

--- Table: security.tx
CREATE TABLE IF NOT EXISTS security.tx (
    tx_id SERIAL PRIMARY KEY,
    subsystem VARCHAR(50) NOT NULL,
    class VARCHAR(50) NOT NULL,
    method VARCHAR(50) NOT NULL,
    UNIQUE (subsystem, class, method)
);

--- Table: security.user_profile
CREATE TABLE IF NOT EXISTS security.user_profile (
    user_id UUID NOT NULL REFERENCES security.user(user_id),
    profile_id UUID NOT NULL REFERENCES security.profile(profile_id)
);

--- Table: security.method_profile
CREATE TABLE IF NOT EXISTS security.method_profile (
    method_id UUID NOT NULL REFERENCES security.method(method_id),
    profile_id UUID NOT NULL REFERENCES security.profile(profile_id)
);

--- Table: security.menu_profile
CREATE TABLE IF NOT EXISTS security.menu_profile (
    menu_id UUID NOT NULL REFERENCES security.menu(menu_id),
    profile_id UUID NOT NULL REFERENCES security.profile(profile_id)
);