-- ============================================
-- BUYBUDDY - COMMON SUPABASE QUERIES
-- Quick reference for database operations
-- ============================================

-- ============================================
-- ADMIN MANAGEMENT
-- ============================================

-- Make a user an admin (run after they sign up)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';

-- List all admin users
SELECT id, email, role, created_at 
FROM profiles 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- Remove admin privileges
UPDATE profiles 
SET role = 'user' 
WHERE email = 'user@example.com';

-- ============================================
-- USER QUERIES
-- ============================================

-- Get all users with their order count
SELECT 
    p.id,
    p.email,
    p.role,
    p.created_at,
    COUNT(o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent
FROM profiles p
LEFT JOIN orders o ON p.id = o.user_id
GROUP BY p.id, p.email, p.role, p.created_at
ORDER BY total_spent DESC;

-- Get user details with recent activity
SELECT 
    p.*,
    (SELECT COUNT(*) FROM orders WHERE user_id = p.id) as order_count,
    (SELECT MAX(created_at) FROM orders WHERE user_id = p.id) as last_order_date
FROM profiles p
WHERE p.email = 'user@example.com';

-- ============================================
-- PRODUCT QUERIES
-- ============================================

-- Get all custom products with creator info
SELECT 
    p.id,
    p.title,
    p.price,
    p.discount_percentage,
    p.category,
    p.created_at,
    pr.email as created_by_email
FROM products p
JOIN profiles pr ON p.created_by = pr.id
ORDER BY p.created_at DESC;

-- Get products by category
SELECT * FROM products 
WHERE category = 'electronics'
ORDER BY created_at DESC;

-- Get products with discount
SELECT 
    title,
    price,
    discount_percentage,
    ROUND(price * (1 - discount_percentage / 100), 2) as discounted_price
FROM products
WHERE discount_percentage > 0
ORDER BY discount_percentage DESC;

-- Count products by category
SELECT 
    category,
    COUNT(*) as product_count
FROM products
GROUP BY category
ORDER BY product_count DESC;

-- ============================================
-- CATEGORY QUERIES
-- ============================================

-- Get all categories
SELECT * FROM categories ORDER BY name;

-- Add a new category
INSERT INTO categories (name) 
VALUES ('new-category-name')
ON CONFLICT (name) DO NOTHING;

-- Delete a category
DELETE FROM categories WHERE name = 'category-to-delete';

-- ============================================
-- ORDER QUERIES
-- ============================================

-- Get all orders with full details
SELECT 
    o.id,
    o.user_email,
    o.total_amount,
    o.discount_amount,
    o.shipping_amount,
    o.status,
    o.created_at,
    json_agg(
        json_build_object(
            'product_title', oi.product_title,
            'quantity', oi.quantity,
            'price', oi.product_price,
            'subtotal', oi.subtotal
        )
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Get orders by status
SELECT * FROM orders 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Get user's order history
SELECT 
    o.*,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_email = 'user@example.com'
GROUP BY o.id
ORDER BY o.created_at DESC;

-- Get order details by ID
SELECT 
    o.*,
    json_agg(
        json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_title', oi.product_title,
            'product_price', oi.product_price,
            'quantity', oi.quantity,
            'subtotal', oi.subtotal
        )
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'ORDER_UUID_HERE'
GROUP BY o.id;

-- Update order status
UPDATE orders 
SET status = 'completed' 
WHERE id = 'ORDER_UUID_HERE';

-- Get recent orders (last 7 days)
SELECT * FROM orders 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- ============================================
-- ORDER STATISTICS
-- ============================================

-- Revenue by status
SELECT 
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value
FROM orders
GROUP BY status
ORDER BY total_revenue DESC;

-- Daily revenue (last 30 days)
SELECT 
    DATE(created_at) as order_date,
    COUNT(*) as orders,
    SUM(total_amount) as revenue
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- Monthly revenue
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as orders,
    SUM(total_amount) as revenue
FROM orders
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Top customers by spending
SELECT 
    user_email,
    COUNT(*) as order_count,
    SUM(total_amount) as total_spent,
    AVG(total_amount) as avg_order_value
FROM orders
GROUP BY user_email
ORDER BY total_spent DESC
LIMIT 10;

-- ============================================
-- PRODUCT ANALYTICS
-- ============================================

-- Most ordered products
SELECT 
    oi.product_id,
    oi.product_title,
    COUNT(*) as times_ordered,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.subtotal) as total_revenue
FROM order_items oi
GROUP BY oi.product_id, oi.product_title
ORDER BY total_revenue DESC
LIMIT 20;

-- Products never ordered
SELECT p.* FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM order_items oi 
    WHERE oi.product_id = p.id::text
);

-- Average order value by product category
SELECT 
    p.category,
    COUNT(DISTINCT o.id) as order_count,
    SUM(oi.subtotal) as total_revenue,
    AVG(oi.subtotal) as avg_item_value
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
LEFT JOIN products p ON oi.product_id = p.id::text
WHERE p.category IS NOT NULL
GROUP BY p.category
ORDER BY total_revenue DESC;

-- ============================================
-- DATA CLEANUP
-- ============================================

-- Delete old pending orders (older than 30 days)
DELETE FROM orders 
WHERE status = 'pending' 
AND created_at < NOW() - INTERVAL '30 days';

-- Delete cancelled orders (older than 90 days)
DELETE FROM orders 
WHERE status = 'cancelled' 
AND created_at < NOW() - INTERVAL '90 days';

-- ============================================
-- BACKUP QUERIES
-- ============================================

-- Export all orders to JSON
SELECT json_agg(row_to_json(orders)) 
FROM orders;

-- Export all products to JSON
SELECT json_agg(row_to_json(products)) 
FROM products;

-- ============================================
-- DEBUGGING QUERIES
-- ============================================

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- TESTING QUERIES
-- ============================================

-- Create a test order (replace UUIDs with actual values)
INSERT INTO orders (
    user_id,
    user_email,
    total_amount,
    discount_amount,
    shipping_amount,
    status,
    shipping_address,
    payment_info
) VALUES (
    'USER_UUID_HERE',
    'test@example.com',
    100.00,
    0,
    15.00,
    'pending',
    '{"fullName": "Test User", "address": "123 Test St", "city": "Test City", "state": "TS", "zipCode": "12345", "country": "USA"}'::jsonb,
    '{"cardHolder": "Test User", "lastFourDigits": "1234"}'::jsonb
);

-- Verify order was created
SELECT * FROM orders 
WHERE user_email = 'test@example.com'
ORDER BY created_at DESC 
LIMIT 1;
