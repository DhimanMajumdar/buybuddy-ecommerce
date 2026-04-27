# BuyBuddy Database Schema Documentation

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE AUTH                                │
│                         auth.users                                   │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ id (UUID) - Primary Key                                       │  │
│  │ email (TEXT)                                                  │  │
│  │ encrypted_password                                            │  │
│  │ created_at                                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ (1:1 via trigger)
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                            PROFILES                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ id (UUID) - PK, FK → auth.users.id                           │  │
│  │ email (TEXT) - UNIQUE                                        │  │
│  │ role (TEXT) - 'user' | 'admin'                               │  │
│  │ created_at (TIMESTAMPTZ)                                     │  │
│  │ updated_at (TIMESTAMPTZ)                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────┬───────────────────┘
             │                                    │
             │ (1:N)                              │ (1:N)
             │                                    │
             ↓                                    ↓
┌─────────────────────────────────┐  ┌──────────────────────────────────┐
│         PRODUCTS                │  │           ORDERS                  │
│  ┌──────────────────────────┐  │  │  ┌───────────────────────────┐  │
│  │ id (UUID) - PK           │  │  │  │ id (UUID) - PK            │  │
│  │ title (TEXT)             │  │  │  │ user_id (UUID) - FK       │  │
│  │ description (TEXT)       │  │  │  │ user_email (TEXT)         │  │
│  │ price (DECIMAL)          │  │  │  │ total_amount (DECIMAL)    │  │
│  │ discount_percentage      │  │  │  │ discount_amount (DECIMAL) │  │
│  │ category (TEXT)          │  │  │  │ shipping_amount (DECIMAL) │  │
│  │ image (TEXT)             │  │  │  │ status (TEXT)             │  │
│  │ created_by (UUID) - FK   │  │  │  │ shipping_address (JSONB)  │  │
│  │ created_at (TIMESTAMPTZ) │  │  │  │ payment_info (JSONB)      │  │
│  │ updated_at (TIMESTAMPTZ) │  │  │  │ created_at (TIMESTAMPTZ)  │  │
│  └──────────────────────────┘  │  │  │ updated_at (TIMESTAMPTZ)  │  │
└─────────────────────────────────┘  │  └───────────────────────────┘  │
                                     └──────────────┬───────────────────┘
                                                    │
                                                    │ (1:N)
                                                    ↓
                                     ┌──────────────────────────────────┐
                                     │        ORDER_ITEMS                │
                                     │  ┌───────────────────────────┐  │
                                     │  │ id (UUID) - PK            │  │
                                     │  │ order_id (UUID) - FK      │  │
                                     │  │ product_id (TEXT)         │  │
                                     │  │ product_title (TEXT)      │  │
                                     │  │ product_price (DECIMAL)   │  │
                                     │  │ quantity (INTEGER)        │  │
                                     │  │ subtotal (DECIMAL)        │  │
                                     │  │ created_at (TIMESTAMPTZ)  │  │
                                     │  └───────────────────────────┘  │
                                     └──────────────────────────────────┘

┌─────────────────────────────────┐
│         CATEGORIES              │
│  ┌──────────────────────────┐  │
│  │ id (UUID) - PK           │  │
│  │ name (TEXT) - UNIQUE     │  │
│  │ created_at (TIMESTAMPTZ) │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

## Table Relationships

### 1. auth.users → profiles (1:1)
- **Type:** One-to-One
- **Relationship:** Each Supabase auth user has exactly one profile
- **Implementation:** Foreign key `profiles.id` references `auth.users.id`
- **Cascade:** ON DELETE CASCADE (deleting user deletes profile)
- **Trigger:** Auto-creates profile when user signs up

### 2. profiles → products (1:N)
- **Type:** One-to-Many
- **Relationship:** One admin can create many products
- **Implementation:** Foreign key `products.created_by` references `profiles.id`
- **Cascade:** ON DELETE CASCADE (deleting admin deletes their products)
- **Business Rule:** Only users with role='admin' can create products

### 3. profiles → orders (1:N)
- **Type:** One-to-Many
- **Relationship:** One user can have many orders
- **Implementation:** Foreign key `orders.user_id` references `profiles.id`
- **Cascade:** ON DELETE CASCADE (deleting user deletes their orders)
- **Business Rule:** Users can only view/create their own orders

### 4. orders → order_items (1:N)
- **Type:** One-to-Many
- **Relationship:** One order contains many items
- **Implementation:** Foreign key `order_items.order_id` references `orders.id`
- **Cascade:** ON DELETE CASCADE (deleting order deletes its items)
- **Business Rule:** Order items inherit permissions from parent order

### 5. categories (Standalone)
- **Type:** Independent
- **Relationship:** No foreign keys (referenced by text in products)
- **Business Rule:** Admins can add/delete, all users can view

## Data Types & Constraints

### profiles
```sql
id              UUID            PRIMARY KEY, REFERENCES auth.users(id)
email           TEXT            UNIQUE, NOT NULL
role            TEXT            NOT NULL, DEFAULT 'user', CHECK (role IN ('user', 'admin'))
created_at      TIMESTAMPTZ     NOT NULL, DEFAULT NOW()
updated_at      TIMESTAMPTZ     NOT NULL, DEFAULT NOW()
```

### products
```sql
id                      UUID        PRIMARY KEY, DEFAULT uuid_generate_v4()
title                   TEXT        NOT NULL
description             TEXT        NOT NULL
price                   DECIMAL     NOT NULL, CHECK (price >= 0)
discount_percentage     DECIMAL     DEFAULT 0, CHECK (0 <= discount_percentage <= 100)
category                TEXT        NOT NULL
image                   TEXT        NOT NULL
created_by              UUID        NOT NULL, REFERENCES profiles(id)
created_at              TIMESTAMPTZ NOT NULL, DEFAULT NOW()
updated_at              TIMESTAMPTZ NOT NULL, DEFAULT NOW()
```

### orders
```sql
id                  UUID        PRIMARY KEY, DEFAULT uuid_generate_v4()
user_id             UUID        NOT NULL, REFERENCES profiles(id)
user_email          TEXT        NOT NULL
total_amount        DECIMAL     NOT NULL, CHECK (total_amount >= 0)
discount_amount     DECIMAL     DEFAULT 0, CHECK (discount_amount >= 0)
shipping_amount     DECIMAL     DEFAULT 0, CHECK (shipping_amount >= 0)
status              TEXT        NOT NULL, DEFAULT 'pending'
                                CHECK (status IN ('pending', 'processing', 'completed', 'cancelled'))
shipping_address    JSONB       NOT NULL
payment_info        JSONB       NOT NULL
created_at          TIMESTAMPTZ NOT NULL, DEFAULT NOW()
updated_at          TIMESTAMPTZ NOT NULL, DEFAULT NOW()
```

### order_items
```sql
id              UUID        PRIMARY KEY, DEFAULT uuid_generate_v4()
order_id        UUID        NOT NULL, REFERENCES orders(id)
product_id      TEXT        NOT NULL
product_title   TEXT        NOT NULL
product_price   DECIMAL     NOT NULL, CHECK (product_price >= 0)
quantity        INTEGER     NOT NULL, CHECK (quantity > 0)
subtotal        DECIMAL     NOT NULL, CHECK (subtotal >= 0)
created_at      TIMESTAMPTZ NOT NULL, DEFAULT NOW()
```

### categories
```sql
id          UUID        PRIMARY KEY, DEFAULT uuid_generate_v4()
name        TEXT        UNIQUE, NOT NULL
created_at  TIMESTAMPTZ NOT NULL, DEFAULT NOW()
```

## JSONB Field Structures

### orders.shipping_address
```json
{
  "fullName": "John Doe",
  "address": "123 Main Street",
  "city": "San Francisco",
  "state": "CA",
  "zipCode": "94103",
  "country": "USA"
}
```

### orders.payment_info
```json
{
  "cardHolder": "John Doe",
  "lastFourDigits": "1234"
}
```

**Security Note:** Never store full credit card numbers or CVV codes!

## Indexes

### Performance Indexes

```sql
-- Products
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_by ON products(created_by);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### Index Usage

- **category**: Fast filtering by product category
- **created_by**: Quick lookup of admin's products
- **created_at**: Efficient sorting by date (DESC for recent first)
- **user_id**: Fast user order lookup
- **status**: Quick filtering by order status
- **order_id**: Fast join with orders table
- **product_id**: Product sales analytics

## Row Level Security (RLS) Policies

### profiles

| Policy Name | Operation | Rule |
|------------|-----------|------|
| Users can view own profile | SELECT | auth.uid() = id |
| Users can update own profile | UPDATE | auth.uid() = id |
| Admins can view all profiles | SELECT | Current user is admin |

### products

| Policy Name | Operation | Rule |
|------------|-----------|------|
| Anyone can view products | SELECT | Authenticated |
| Admins can insert products | INSERT | Current user is admin |
| Admins can update products | UPDATE | Current user is admin |
| Admins can delete products | DELETE | Current user is admin |

### orders

| Policy Name | Operation | Rule |
|------------|-----------|------|
| Users can view own orders | SELECT | auth.uid() = user_id |
| Users can create own orders | INSERT | auth.uid() = user_id |
| Admins can view all orders | SELECT | Current user is admin |
| Admins can update all orders | UPDATE | Current user is admin |

### order_items

| Policy Name | Operation | Rule |
|------------|-----------|------|
| Users can view own order items | SELECT | Order belongs to user |
| Users can create order items | INSERT | Order belongs to user |
| Admins can view all order items | SELECT | Current user is admin |

### categories

| Policy Name | Operation | Rule |
|------------|-----------|------|
| Anyone can view categories | SELECT | Authenticated |
| Admins can insert categories | INSERT | Current user is admin |
| Admins can delete categories | DELETE | Current user is admin |

## Triggers

### 1. Auto-create Profile on Signup

```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION handle_new_user();
```

**Purpose:** Automatically creates a profile when user signs up
**Timing:** After user is created in auth.users
**Action:** Inserts row in profiles with role='user'

### 2. Update Timestamp Triggers

```sql
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Purpose:** Automatically updates updated_at timestamp
**Timing:** Before any UPDATE operation
**Action:** Sets updated_at = NOW()

## Business Rules

### User Management
1. All users start with role='user'
2. Admins must be manually promoted via SQL
3. Email must be unique across all profiles
4. Deleting a user cascades to all their data

### Product Management
1. Only admins can create/edit/delete products
2. Products must have positive prices
3. Discount percentage must be 0-100
4. Products are soft-deleted (keep for order history)

### Order Management
1. Users can only create orders for themselves
2. Orders must have at least one item
3. Order status follows: pending → processing → completed
4. Orders can be cancelled at any time
5. Completed orders cannot be modified

### Cart Management
1. Cart is stored in browser localStorage
2. Cart is user-specific (keyed by user ID)
3. Cart persists across sessions
4. Cart is cleared after successful order

### Payment Security
1. Never store full credit card numbers
2. Only store last 4 digits for reference
3. Never store CVV codes
4. Use HTTPS for all transactions

## Query Patterns

### Common Queries

```sql
-- Get user's orders with items
SELECT o.*, json_agg(oi.*) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 'USER_UUID'
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Get product sales statistics
SELECT 
    oi.product_id,
    oi.product_title,
    SUM(oi.quantity) as total_sold,
    SUM(oi.subtotal) as total_revenue
FROM order_items oi
GROUP BY oi.product_id, oi.product_title
ORDER BY total_revenue DESC;

-- Get revenue by date
SELECT 
    DATE(created_at) as date,
    COUNT(*) as orders,
    SUM(total_amount) as revenue
FROM orders
WHERE status = 'completed'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## Scaling Considerations

### Current Capacity
- Suitable for: 0-100K users
- Order volume: 0-1M orders/month
- Storage: Minimal (text-based data)

### Future Optimizations
1. **Partitioning**: Partition orders by date for large datasets
2. **Archiving**: Move old orders to archive tables
3. **Caching**: Cache product lists and categories
4. **Read Replicas**: Add read replicas for analytics
5. **CDN**: Store product images in CDN

### Monitoring Metrics
- Query response times
- Table sizes
- Index usage
- RLS policy performance
- Connection pool usage

## Backup Strategy

### Recommended Approach
1. **Automatic Backups**: Enable daily backups in Supabase
2. **Point-in-Time Recovery**: Keep 7-day PITR window
3. **Export Critical Data**: Weekly exports of orders/products
4. **Test Restores**: Monthly restore testing

### Critical Tables (Priority Order)
1. orders & order_items (revenue data)
2. profiles (user data)
3. products (inventory)
4. categories (configuration)
