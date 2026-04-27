# Supabase Database Setup Guide for BuyBuddy

This guide will help you set up the complete database schema for the BuyBuddy e-commerce application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Your Supabase project created
- Access to the SQL Editor in your Supabase dashboard

## Database Schema Overview

The BuyBuddy application uses the following tables:

1. **profiles** - User profiles with role management (user/admin)
2. **categories** - Product categories (custom + FakeStore API categories)
3. **products** - Custom products created by admins
4. **orders** - Customer orders with shipping and payment info
5. **order_items** - Individual items within each order

## Setup Instructions

### Step 1: Access Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Schema SQL

1. Open the `supabase-schema.sql` file
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run** or press `Ctrl/Cmd + Enter`

The script will:
- Create all necessary tables
- Set up Row Level Security (RLS) policies
- Create indexes for performance
- Add triggers for automatic profile creation
- Insert default categories

### Step 3: Verify Installation

Run this query to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- categories
- order_items
- orders
- products
- profiles

### Step 4: Create Your First Admin User

After signing up through the application, you need to manually set your first admin user:

```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Table Details

### 1. Profiles Table

Extends Supabase auth with user roles.

**Columns:**
- `id` (UUID) - References auth.users
- `email` (TEXT) - User email
- `role` (TEXT) - 'user' or 'admin'
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Security:**
- Users can view/update their own profile
- Admins can view all profiles
- Auto-created on user signup via trigger

### 2. Categories Table

Stores custom product categories.

**Columns:**
- `id` (UUID) - Primary key
- `name` (TEXT) - Unique category name
- `created_at` (TIMESTAMPTZ)

**Security:**
- Anyone authenticated can view
- Only admins can insert/delete

**Default Categories:**
- electronics
- jewelery
- men's clothing
- women's clothing

### 3. Products Table

Custom products created by admins.

**Columns:**
- `id` (UUID) - Primary key
- `title` (TEXT) - Product name
- `description` (TEXT) - Product description
- `price` (DECIMAL) - Product price
- `discount_percentage` (DECIMAL) - Discount (0-100)
- `category` (TEXT) - Product category
- `image` (TEXT) - Image URL
- `created_by` (UUID) - Admin who created it
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Security:**
- Anyone authenticated can view
- Only admins can insert/update/delete

**Indexes:**
- category (for filtering)
- created_by (for admin queries)
- created_at (for sorting)

### 4. Orders Table

Customer orders with full details.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Customer reference
- `user_email` (TEXT) - Customer email
- `total_amount` (DECIMAL) - Final total
- `discount_amount` (DECIMAL) - Discount applied
- `shipping_amount` (DECIMAL) - Shipping cost
- `status` (TEXT) - 'pending', 'processing', 'completed', 'cancelled'
- `shipping_address` (JSONB) - Address object
- `payment_info` (JSONB) - Payment details (last 4 digits only)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**JSONB Structure:**

```json
// shipping_address
{
  "fullName": "John Doe",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zipCode": "94103",
  "country": "USA"
}

// payment_info
{
  "cardHolder": "John Doe",
  "lastFourDigits": "1234"
}
```

**Security:**
- Users can view/create their own orders
- Admins can view/update all orders

**Indexes:**
- user_id (for user queries)
- status (for filtering)
- created_at (for sorting)

### 5. Order Items Table

Individual products within orders.

**Columns:**
- `id` (UUID) - Primary key
- `order_id` (UUID) - Order reference
- `product_id` (TEXT) - Product ID (string for FakeStore API compatibility)
- `product_title` (TEXT) - Product name snapshot
- `product_price` (DECIMAL) - Price at time of order
- `quantity` (INTEGER) - Quantity ordered
- `subtotal` (DECIMAL) - price × quantity
- `created_at` (TIMESTAMPTZ)

**Security:**
- Users can view/create items for their orders
- Admins can view all order items

**Indexes:**
- order_id (for order queries)
- product_id (for product analytics)

## Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

### User Permissions
- View their own profile, orders, and order items
- Create their own orders and order items
- View all products and categories

### Admin Permissions
- All user permissions
- View all profiles and orders
- Create, update, and delete products
- Create and delete categories
- Update order status

## Triggers

### 1. Auto-create Profile
When a user signs up via Supabase Auth, a profile is automatically created with role='user'.

### 2. Update Timestamps
The `updated_at` column is automatically updated on:
- profiles
- products
- orders

## Testing Queries

### Get all orders with items
```sql
SELECT 
    o.id,
    o.user_email,
    o.total_amount,
    o.status,
    o.created_at,
    json_agg(
        json_build_object(
            'product_title', oi.product_title,
            'quantity', oi.quantity,
            'subtotal', oi.subtotal
        )
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id
ORDER BY o.created_at DESC;
```

### Get user's order history
```sql
SELECT * FROM orders 
WHERE user_id = 'USER_UUID' 
ORDER BY created_at DESC;
```

### Get all products with creator info
```sql
SELECT 
    p.*,
    pr.email as creator_email
FROM products p
JOIN profiles pr ON p.created_by = pr.id
ORDER BY p.created_at DESC;
```

### Check admin users
```sql
SELECT id, email, role, created_at 
FROM profiles 
WHERE role = 'admin';
```

## Common Issues & Solutions

### Issue: Profile not created on signup
**Solution:** Check if the trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

If missing, re-run the trigger creation section from the schema.

### Issue: Permission denied errors
**Solution:** Verify RLS policies are active:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Issue: Can't create admin user
**Solution:** Use the Supabase dashboard:
1. Go to Authentication > Users
2. Find your user
3. Go to SQL Editor and run:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'YOUR_USER_ID';
```

## Environment Variables

Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: Supabase Dashboard > Settings > API

## Security Best Practices

1. **Never store full credit card numbers** - Only last 4 digits
2. **Use RLS policies** - Already configured in schema
3. **Validate on server** - Use Supabase Edge Functions for sensitive operations
4. **Regular backups** - Enable automatic backups in Supabase dashboard
5. **Monitor logs** - Check Supabase logs for suspicious activity

## Next Steps

1. Run the schema SQL in your Supabase project
2. Create your first admin user
3. Test the application signup/login flow
4. Add products via the admin panel
5. Test the complete checkout flow

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify RLS policies are correct
3. Ensure your environment variables are set
4. Check the browser console for errors

## Schema Diagram

```
auth.users (Supabase Auth)
    ↓
profiles (role: user/admin)
    ↓
    ├─→ products (created_by)
    └─→ orders (user_id)
            ↓
        order_items (order_id)

categories (standalone)
```

## Maintenance

### Add a new admin
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'new-admin@example.com';
```

### View order statistics
```sql
SELECT 
    status,
    COUNT(*) as count,
    SUM(total_amount) as total_revenue
FROM orders
GROUP BY status;
```

### Clean up old pending orders (optional)
```sql
-- Delete pending orders older than 30 days
DELETE FROM orders 
WHERE status = 'pending' 
AND created_at < NOW() - INTERVAL '30 days';
```
