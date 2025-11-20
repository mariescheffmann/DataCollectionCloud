CREATE TABLE recipes (
    id SERIAL PRIMARY KEY, 
    recipe_description TEXT NOT NULL
);

-- TODO: insert recipies???? -lrp

CREATE TABLE operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(355) UNIQUE NOT NULL
);

-- TODO: insert operator???? -lrp

CREATE TABLE states (
    id INTEGER PRIMARY KEY,
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

CREATE TABLE production_lines (
    id INTEGER UNIQUE NOT NULL PRIMARY KEY 
);

-- TODO: insert production line???? -lrp

CREATE TABLE machines (
    id SERIAL PRIMARY KEY,
    type_id INTEGER NOT NULL REFERENCES machine_types(id),
    line_id INTEGER REFERENCES production_lines(id)
);

-- TODO: insert machine???? -lrp

CREATE TABLE alarms (
    id SERIAL PRIMARY KEY,
    description VARCHAR(355) UNIQUE,
    created_on TIMESTAMP NOT NULL,
    machine_id INTEGER NOT NULL REFERENCES machines(id)
);

-- TODO: insert alarm types as table OR is every alarm inserted through backend code with individual description?? -lrp

CREATE TABLE machine_state_relation (
    id SERIAL PRIMARY KEY,
    machine_id INTEGER REFERENCES machines(id),
    state_id INTEGER REFERENCES states(id),
    start_time TIMESTAMP NOT NULL
);

CREATE TABLE operator_machine_relation (
    id SERIAL PRIMARY KEY,
    operator_id INTEGER REFERENCES operators(id),
    machine_id INTEGER REFERENCES machines(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL
);

CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    batch_description TEXT,
    line_id INTEGER REFERENCES production_lines(id),
    planned_start_time TIMESTAMP,
    planned_end_time TIMESTAMP,
    recipe_id INTEGER REFERENCES recipes(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    total_output INTEGER,
    number_of_good_output INTEGER,
    energy_usage DECIMAL,
    consumable_usage DECIMAL
);

CREATE TABLE recipe_batch_relation (
    id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipes(id),
    batch_id INTEGER REFERENCES batches(id)
);