CREATE TABLE operators (
    name VARCHAR(355) UNIQUE NOT NULL PRIMARY KEY
);

INSERT INTO operators(name) VALUES ('Anonymous');

CREATE TABLE states (
    id INTEGER UNIQUE NOT NULL PRIMARY KEY,
    description VARCHAR(355) UNIQUE NOT NULL
);

INSERT INTO states(id, description)
VALUES
(0, 'STATE_UNDEFINED'),
(1, 'STATE_CLEARING'),
(2, 'STATE_STOPPED'),
(3, 'STATE_STARTING'),
(4, 'STATE_IDLE'),
(5, 'STATE_SUSPENDED'),
(6, 'STATE_EXECUTE'),
(7, 'STATE_STOPPING'),
(8, 'STATE_ABORTING'),
(9, 'STATE_APORTED'),
(10, 'STATE_HOLDING'),
(11, 'STATE_HELD'),
(12, 'STATE_UNHOLDING'),
(13, 'STATE_SUSPENDING'),
(14, 'STATE_UNSUSPENDING'),
(15, 'STATE_RESETTING'),
(16, 'STATE_COMPLETING'),
(17, 'STATE_COMLPETED'),
(30, 'STATE_DEACTIVATING'),
(31, 'STATE_DEACTIVATED'),
(32, 'STATE_ACTIVATING');

CREATE TABLE machine_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(355) UNIQUE NOT NULL
);

INSERT INTO machine_types (name)
VALUES('anon_type_1'), ('anon_type_2');

CREATE TABLE machines (
    id SERIAL PRIMARY KEY,
    type_id INTEGER NOT NULL REFERENCES machine_types(id)
);

INSERT INTO machines(id, type_id)
VALUES
(1, 1);

CREATE TABLE alarms (
    id SERIAL PRIMARY KEY,
    description VARCHAR(355) UNIQUE,
    created_on TIMESTAMP NOT NULL,
    machine_id INTEGER NOT NULL REFERENCES machines(id)
);

CREATE TABLE machine_state_relation (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER REFERENCES machines(id),
    state_id INTEGER REFERENCES states(id),
    start_time TIMESTAMP NOT NULL
);

CREATE TABLE operator_machine_relation (
    id SERIAL PRIMARY KEY,
    operator_name VARCHAR(355) REFERENCES operators(name),
    machine_id INTEGER REFERENCES machines(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP
);

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    recipe_name TEXT,
    machine_id INTEGER REFERENCES machines(id),
    decoration VARCHAR(355),
    g_number VARCHAR(355),
    material_id VARCHAR(355),
    stage VARCHAR(355),
    recipe_version VARCHAR(355)
);
