--- Table: people.staff
CREATE TABLE IF NOT EXISTS people.staff (
    user_id UUID PRIMARY KEY,
    phone VARCHAR(20),
    "address" TEXT,
    FOREIGN KEY (user_id) REFERENCES security.user(user_id)
);

--- Table: people.attendee
CREATE TABLE IF NOT EXISTS people.attendee (
    attendee_ci INT PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    surname VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES people.attendee(user_id)
);

--- Table: people.attendee_event
CREATE TABLE IF NOT EXISTS people.attendee_event (
    attendee_ci INTEGER NOT NULL,
    event_id UUID NOT NULL,
    attended BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (attendee_ci, event_id),
    FOREIGN KEY (attendee_ci) REFERENCES people.attendee(attendee_ci),
    FOREIGN KEY (event_id) REFERENCES events.event(event_id)
);

--- Table: people.staff_role
CREATE TABLE IF NOT EXISTS people.staff_role (
    staff_role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) UNIQUE NOT NULL,
    desc_txt TEXT
);

--- Table: people.staff_event
CREATE TABLE IF NOT EXISTS people.staff_event (
    staff_id UUID NOT NULL,
    event_id UUID NOT NULL,
    staff_role_id UUID NOT NULL,
    cost_amt DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (staff_id, event_id),
    FOREIGN KEY (staff_id) REFERENCES people.staff(user_id),
    FOREIGN KEY (event_id) REFERENCES events.event(event_id),
    FOREIGN KEY (staff_role_id) REFERENCES people.staff_role(staff_role_id)
);