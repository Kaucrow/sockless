--- Table: events.location
CREATE TABLE IF NOT EXISTS events.location (
    location_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    UNIQUE (country, city, "name")
);

--- Table: events.event
CREATE TABLE IF NOT EXISTS events.event (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    start_dt TIMESTAMP WITH TIME ZONE NOT NULL,
    end_dt TIMESTAMP WITH TIME ZONE NOT NULL,
    desc_txt TEXT
);

--- Table: events.location_reservation
CREATE TABLE IF NOT EXISTS events.location_reservation (
    event_id UUID PRIMARY KEY,
    location_id UUID NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    UNIQUE (event_id, location_id),
    FOREIGN KEY (location_id) REFERENCES events.location(location_id),
    FOREIGN KEY (event_id) REFERENCES events.event(event_id)
);

--- Table: events.flyer
CREATE TABLE IF NOT EXISTS events.flyer (
    flyer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID UNIQUE NOT NULL,
    url VARCHAR(512) NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events.event(event_id)
);

--- Table: events.ticket_desc
CREATE TABLE IF NOT EXISTS events.ticket_desc (
    ticket_desc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    desc_text TEXT,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (event_id) REFERENCES events.event(event_id)
);

--- Table: events.ticket
CREATE TABLE IF NOT EXISTS events.ticket (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_desc_id UUID NOT NULL,
    user_id UUID,
    FOREIGN KEY (ticket_desc_id) REFERENCES events.ticket_desc(ticket_desc_id),
    FOREIGN KEY (user_id) REFERENCES security.user(user_id)
)