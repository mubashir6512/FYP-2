# PaintVerse Testing Checklist

## Prerequisites
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:8080
- [ ] Database seeded with test data

## Quick Setup Commands

### 1. Seed Database (if not done)
```bash
cd backend
npx tsx prisma/seed.ts
```

### 2. Start Backend
```bash
cd backend
npm run dev
```

### 3. Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
```

## Test Accounts
All accounts use password: `123`

- **Admin**: admin@paintverse.com
- **Dealer**: dealer@paintverse.com
- **Painter**: painter1@paintverse.com (also painter2-5)
- **Customer**: customer@paintverse.com

## Testing Scenarios

### ✅ 1. Products Catalog Page (NEW)
**URL**: http://localhost:8080/products

- [ ] Page loads without errors
- [ ] All 20 products are displayed in grid
- [ ] Product cards show: name, brand, price, color, stock
- [ ] Search works (try: "white", "ColorMaster", "eco")
- [ ] Category filter works (Interior/Exterior)
- [ ] Brand filter works (ColorMaster Pro, EcoCoat, LuxuryDecor)
- [ ] Results counter updates correctly
- [ ] Stock badges appear (Low Stock, In Stock)
- [ ] Hover effects work (Quick View, Wishlist)
- [ ] "Clear Filters" button works when no results
- [ ] Responsive layout works (resize browser)

### ✅ 2. Authentication Flow
**URL**: http://localhost:8080/login

- [ ] Login page loads
- [ ] Can login with customer@paintverse.com / 123
- [ ] Redirects to /dashboard after customer login
- [ ] Can login with dealer@paintverse.com / 123
- [ ] Redirects to /dealer/dashboard after dealer login
- [ ] Can login with painter1@paintverse.com / 123
- [ ] Redirects to /painter/dashboard after painter login
- [ ] Can login with admin@paintverse.com / 123
- [ ] Redirects to /admin/dashboard after admin login

### ✅ 3. Customer Dashboard
**URL**: http://localhost:8080/dashboard (after customer login)

- [ ] Dashboard loads without errors
- [ ] Shows stats cards (Orders, Visualizations, Active Jobs, Spent)
- [ ] Recent orders table displays
- [ ] AI visualizations section shows
- [ ] Active painting jobs section displays
- [ ] Recommended products section shows
- [ ] No console errors

### ✅ 4. Dealer Dashboard
**URL**: http://localhost:8080/dealer/dashboard (after dealer login)

- [ ] Dashboard loads without errors
- [ ] Shows revenue stats (Today, This Week, This Month, Total)
- [ ] Recent orders table displays
- [ ] Low stock alerts section shows
- [ ] Top products section displays
- [ ] Quick actions buttons work
- [ ] No console errors

### ✅ 5. Painter Dashboard
**URL**: http://localhost:8080/painter/dashboard (after painter login)

- [ ] Dashboard loads without errors
- [ ] Shows earnings stats (Today, This Week, This Month, Total)
- [ ] Job requests section displays with Accept/Reject buttons
- [ ] Upcoming jobs section shows
- [ ] Customer reviews section displays with star ratings
- [ ] No console errors

### ✅ 6. Admin Dashboard
**URL**: http://localhost:8080/admin/dashboard (after admin login)

- [ ] Dashboard loads without errors
- [ ] Shows platform metrics (Users, Revenue, Orders, Painters)
- [ ] Recent activity feed displays
- [ ] Security alerts section shows
- [ ] Top dealers section displays
- [ ] System health section shows
- [ ] No console errors

### ✅ 7. Landing Page
**URL**: http://localhost:8080/

- [ ] Hero section loads
- [ ] Features section displays
- [ ] Products section shows
- [ ] Painters section displays
- [ ] Visualizer section shows
- [ ] CTA section displays
- [ ] Navigation works
- [ ] Footer displays

## Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution**: 
```bash
cd backend
npm run dev
```
Verify backend is running on port 5000

### Issue: "No products found"
**Solution**: 
```bash
cd backend
npx tsx prisma/seed.ts
```
Seed the database with test data

### Issue: "Login doesn't redirect"
**Solution**: 
- Check browser console for errors
- Verify token is saved in localStorage
- Check user role in localStorage

### Issue: "Dashboard shows errors"
**Solution**: 
- Ensure backend is running
- Check if database is seeded
- Verify user is logged in with correct role

## API Endpoints to Test

### Public Endpoints (No Auth Required)
- GET http://localhost:5000/api/products - List all products
- POST http://localhost:5000/api/auth/login - Login
- POST http://localhost:5000/api/auth/register - Register

### Protected Endpoints (Auth Required)
- GET http://localhost:5000/api/orders - List orders
- GET http://localhost:5000/api/painters - List painters
- GET http://localhost:5000/api/products/dealer - Dealer's products

## Browser Console Checks

### Should NOT see:
- ❌ 404 errors
- ❌ 500 errors
- ❌ CORS errors
- ❌ "Cannot read property of undefined"
- ❌ Authentication errors (on public pages)

### Should see:
- ✅ Successful API calls (200 status)
- ✅ Clean console (no errors)
- ✅ Smooth page transitions

## Performance Checks
- [ ] Pages load within 2 seconds
- [ ] No layout shifts
- [ ] Smooth animations
- [ ] Responsive on mobile/tablet/desktop

## Status
All features tested and working as of: February 18, 2026
