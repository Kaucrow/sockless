--- Table: finance.cost_category
CREATE TABLE IF NOT EXISTS finance.cost_category (
    cost_category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    desc_txt TEXT
);

--- Table: finance.cost
CREATE TABLE IF NOT EXISTS finance.cost (
    cost_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cost_category_id UUID NOT NULL,
    event_id UUID NOT NULL,
    desc_txt TEXT,
    amt DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (cost_category_id) REFERENCES finance.cost_category(cost_category_id),
    FOREIGN KEY (event_id) REFERENCES events.event(event_id)
);

--- Table: finance.payment_method
CREATE TABLE IF NOT EXISTS finance.payment_method (
    payment_method_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL
);

--- Table: finance.payment
CREATE TABLE IF NOT EXISTS finance.payment (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    ticket_id UUID NOT NULL,
    payment_method_id UUID NOT NULL,
    amt DECIMAL(10, 2) NOT NULL,
    dt TIMESTAMP WITH TIME ZONE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES security.user(user_id),
    FOREIGN KEY (ticket_id) REFERENCES events.ticket(ticket_id),
    FOREIGN KEY (payment_method_id) REFERENCES finance.payment_method(payment_method_id)
);