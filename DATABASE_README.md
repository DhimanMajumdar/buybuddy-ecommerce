# BuyBuddy Database Documentation

Complete database documentation for the BuyBuddy e-commerce application using Supabase PostgreSQL.

## 📚 Documentation Files

This repository contains comprehensive database documentation:

| File | Description | Use When |
|------|-------------|----------|
| **QUICK_START.md** | 5-minute setup guide | Setting up for the first time |
| **supabase-schema.sql** | Complete database schema | Creating/updating database |
| **SUPABASE_SETUP.md** | Detailed setup instructions | Need step-by-step guidance |
| **DATABASE_SCHEMA.md** | Schema documentation & ERD | Understanding database structure |
| **MIGRATION_GUIDE.md** | Migration instructions | Moving from another database |
| **supabase-queries.sql** | Common SQL queries | Daily database operations |

## 🚀 Quick Links

- **New to this project?** → Start with [QUICK_START.md](QUICK_START.md)
- **Need to set up database?** → Use [supabase-schema.sql](supabase-schema.sql)
- **Want detailed docs?** → Read [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **Migrating data?** → Follow [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)
- **Need SQL examples?** → Check [supabase-queries.sql](supabase-queries.sql)

## 📊 Database Overview

### Tables

```
┌─────────────────┬──────────────┬─────────────────────────────────┐
│ Table           │ Rows (Est.)  │ Purpose                         │
├─────────────────┼──────────────┼─────────────────────────────────┤
│ profiles        │ 1K - 100K    │ User accounts & roles           │
│ products        │ 100 - 10K    │ Custom products by admins       │
│ categories      │ 10 - 100     │ Product categories              │
│ orders          │ 1K - 1M      │ Customer orders                 │
│ order_items     │ 5K - 5M      │ Items within orders             │
└─────────────────┴──────────────┴─────────────────────────────────┘
```

### Key Features

✅ **Row Level Security (RLS)** - Automatic data access control  
✅ **Auto-create Profiles** - Trigger creates profile on signup  
✅ **Cascading Deletes** - Clean up related data automatically  
✅ **Optimized Indexes** - Fast queries on common operations  
✅ **JSONB Support** - Flexible address & payment storage  
✅ **Timestamp Tracking** - Auto-update modified timestamps  

## 🏗️ Architecture

### Data Flow

```
User Signup
    ↓
auth.users (Supabase Auth)
    ↓ (trigger)
profiles (role: user)
    ↓
User Actions:
    ├─→ Browse products (FakeStore API + Custom)
    ├─→ Add to cart (localStorage)
    └─→ Checkout
            ↓
        Create order
            ↓
        Create order_items
            ↓
        Clear cart

Admin Actions:
    ├─→ Create products
    ├─→ Manage categories
    └─→ View all orders
```

### Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Row Level Security                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Regular Users:                                          │
│    ✓ View own profile, orders, order items              │
│    ✓ Create own orders                                  │
│    ✓ View all products & categories                     │
│    ✗ Cannot view other users' data                      │
│    ✗ Cannot create/edit products                        │
│                                                          │
│  Admin Users:                                            │
│    ✓ All regular user permissions                       │
│    ✓ View all profiles & orders                         │
│    ✓ Create/edit/delete products                        │
│    ✓ Create/delete categories                           │
│    ✓ Update order status                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- Basic understanding of SQL (helpful)

### Installation

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd buybuddy
   npm install
   ```

2. **Set Up Supabase**
   - Create project at https://supabase.com
   - Copy Project URL and Anon Key
   - Update `.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
     ```

3. **Run Database Schema**
   - Open Supabase SQL Editor
   - Copy contents of `supabase-schema.sql`
   - Execute the SQL

4. **Create Admin User**
   - Sign up through the app
   - Run in SQL Editor:
     ```sql
     UPDATE profiles SET role = 'admin' 
     WHERE email = 'your-email@example.com';
     ```

5. **Start Development**
   ```bash
   npm run dev
   ```

**Detailed instructions:** See [QUICK_START.md](QUICK_START.md)

## 📖 Schema Reference

### Core Tables

#### profiles
User accounts with role-based access control.

```sql
id              UUID            PK, FK → auth.users
email           TEXT            UNIQUE
role            TEXT            'user' | 'admin'
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

#### products
Custom products created by admins.

```sql
id                      UUID        PK
title                   TEXT
description             TEXT
price                   DECIMAL(10,2)
discount_percentage     DECIMAL(5,2)
category                TEXT
image                   TEXT
created_by              UUID        FK → profiles
created_at              TIMESTAMPTZ
updated_at              TIMESTAMPTZ
```

#### orders
Customer orders with shipping and payment info.

```sql
id                  UUID            PK
user_id             UUID            FK → profiles
user_email          TEXT
total_amount        DECIMAL(10,2)
discount_amount     DECIMAL(10,2)
shipping_amount     DECIMAL(10,2)
status              TEXT            'pending' | 'processing' | 'completed' | 'cancelled'
shipping_address    JSONB
payment_info        JSONB
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
```

#### order_items
Individual items within orders.

```sql
id              UUID            PK
order_id        UUID            FK → orders
product_id      TEXT
product_title   TEXT
product_price   DECIMAL(10,2)
quantity        INTEGER
subtotal        DECIMAL(10,2)
created_at      TIMESTAMPTZ
```

#### categories
Product categories.

```sql
id          UUID            PK
name        TEXT            UNIQUE
created_at  TIMESTAMPTZ
```

**Full schema details:** See [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

## 🔍 Common Operations

### User Management

```sql
-- List all users
SELECT * FROM profiles ORDER BY created_at DESC;

-- Make user an admin
UPDATE profiles SET role = 'admin' WHERE email = 'user@example.com';

-- Get user statistics
SELECT 
    email,
    role,
    (SELECT COUNT(*) FROM orders WHERE user_id = profiles.id) as order_count
FROM profiles;
```

### Product Management

```sql
-- Add product
INSERT INTO products (title, description, price, category, image, created_by)
VALUES ('Product Name', 'Description', 99.99, 'electronics', 'url', 'admin-uuid');

-- Update product price
UPDATE products SET price = 89.99 WHERE id = 'product-uuid';

-- Delete product
DELETE FROM products WHERE id = 'product-uuid';
```

### Order Management

```sql
-- Get order with items
SELECT 
    o.*,
    json_agg(oi.*) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 'order-uuid'
GROUP BY o.id;

-- Update order status
UPDATE orders SET status = 'completed' WHERE id = 'order-uuid';

-- Get revenue statistics
SELECT 
    status,
    COUNT(*) as count,
    SUM(total_amount) as revenue
FROM orders
GROUP BY status;
```

**More queries:** See [supabase-queries.sql](supabase-queries.sql)

## 🛡️ Security

### Best Practices

1. **Never Store Sensitive Data**
   - ❌ Full credit card numbers
   - ❌ CVV codes
   - ❌ Plain text passwords
   - ✅ Only last 4 digits of cards
   - ✅ Use Supabase Auth for passwords

2. **Use RLS Policies**
   - Already configured in schema
   - Automatically enforced by Supabase
   - Users can only access their own data

3. **Environment Variables**
   - Never commit `.env.local` to git
   - Use different keys for dev/prod
   - Rotate keys regularly

4. **Regular Backups**
   - Enable automatic backups in Supabase
   - Test restore procedures
   - Keep 30-day retention

### Security Checklist

- [ ] RLS enabled on all tables
- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Regular backups configured
- [ ] Admin accounts limited
- [ ] API keys rotated
- [ ] Error logging enabled
- [ ] Rate limiting configured

## 📈 Performance

### Optimization Tips

1. **Indexes** - Already created for common queries
2. **Pagination** - Limit results for large datasets
3. **Caching** - Cache product lists and categories
4. **CDN** - Store images externally
5. **Connection Pooling** - Supabase handles this

### Monitoring

Monitor these metrics in Supabase Dashboard:

- Query performance
- Database size
- Connection count
- Error rates
- API usage

## 🔧 Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check failed orders

**Weekly:**
- Review new users
- Check product inventory
- Analyze sales trends

**Monthly:**
- Database cleanup
- Performance review
- Security audit
- Backup verification

### Cleanup Queries

```sql
-- Delete old pending orders (30+ days)
DELETE FROM orders 
WHERE status = 'pending' 
AND created_at < NOW() - INTERVAL '30 days';

-- Delete cancelled orders (90+ days)
DELETE FROM orders 
WHERE status = 'cancelled' 
AND created_at < NOW() - INTERVAL '90 days';
```

## 🐛 Troubleshooting

### Common Issues

**Profile not created on signup**
```sql
-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Manually create if needed
INSERT INTO profiles (id, email, role)
SELECT id, email, 'user' FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
```

**Permission denied errors**
```sql
-- Verify RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check user role
SELECT email, role FROM profiles WHERE email = 'your-email';
```

**Slow queries**
```sql
-- Check index usage
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 'uuid';

-- Rebuild indexes if needed
REINDEX TABLE orders;
```

## 📞 Support

### Resources

- 📚 [Supabase Documentation](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 📧 [Email Support](mailto:support@example.com)

### Getting Help

1. Check the documentation files
2. Search existing issues
3. Ask in Supabase Discord
4. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

## 🚀 Deployment

### Production Checklist

- [ ] Run schema in production Supabase
- [ ] Update production environment variables
- [ ] Create production admin account
- [ ] Enable automatic backups
- [ ] Set up monitoring
- [ ] Configure rate limiting
- [ ] Test complete user flow
- [ ] Test admin functionality
- [ ] Verify RLS policies
- [ ] Enable SSL/HTTPS

### Environment Setup

**Development:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-key
```

**Production:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-key
```

## 📝 Contributing

### Making Changes

1. Test changes in development first
2. Document schema changes
3. Update relevant documentation files
4. Test RLS policies
5. Verify migrations work
6. Update version numbers

### Documentation Updates

When updating the database:

1. Update `supabase-schema.sql`
2. Update `DATABASE_SCHEMA.md`
3. Add queries to `supabase-queries.sql`
4. Update migration guide if needed
5. Test all documentation steps

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Supabase](https://supabase.com)
- Uses [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Icons from [Lucide](https://lucide.dev)

---

**Questions?** Check the documentation files or open an issue!

**Ready to start?** → [QUICK_START.md](QUICK_START.md)
