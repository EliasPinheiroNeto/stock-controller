CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    password VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    user_id INT NOT NULL,
    CONSTRAINT fk_user_employees FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    description VARCHAR(512),
    stock INT,
    created_at TIMESTAMP DEFAULT NOW(),

    user_id INT NOT NULL,
    CONSTRAINT fk_user_items FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    employee_id INT,
    CONSTRAINT fk_employee_items FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description VARCHAR(512),
    created_at TIMESTAMP DEFAULT NOW(),

    user_id INT NOT NULL,
    CONSTRAINT fk_user_categories FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    employee_id INT,
    CONSTRAINT fk_employee_categories FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS item_category (
    id SERIAL PRIMARY KEY,

    item_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT fk_item FOREIGN KEY (item_id)
        REFERENCES items(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_category FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS movement_type (
    id SERIAL PRIMARY KEY,
    type VARCHAR(3) NOT NULL UNIQUE -- IN | OUT
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),

    user_id INT NOT NULL,
    employee_id INT,

    movement_type_id INT NOT NULL,

    CONSTRAINT fk_user_stock_movements FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_employee_stock_movements FOREIGN KEY (employee_id)
        REFERENCES employees(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_movement_type FOREIGN KEY (movement_type_id)
        REFERENCES movement_type(id)
        ON DELETE CASCADE
);

-- Inserir valores na tabela movement_type
INSERT INTO movement_type(type)
VALUES ('IN'), ('OUT');
