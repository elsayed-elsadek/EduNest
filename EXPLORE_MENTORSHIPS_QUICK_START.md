# 🚀 Quick Start Guide - Explore Mentorships Feature

## Testing the Feature

### 1. **Navigate to the Page**

- Click "Explore All Programs" button from the Student Dashboard CTA section
- Or navigate directly to: `http://localhost:5173/mentorships`

### 2. **Test the Sidebar Filters**

```
✓ Search by keyword - Type in search box → results filter in real-time (500ms debounce)
✓ Category checkboxes - Check/uncheck categories → filters apply instantly
✓ Price slider - Drag min/max sliders → price range updates instantly
✓ Reset button - Clears all filters and returns to default view
```

### 3. **Test the Grid**

```
✓ Cards display correctly with all elements
✓ Images load (or show fallback gradient if null)
✓ Category badge shows in yellow
✓ Discount badge shows in red (only if discount > 0)
✓ Mentor name displays in blue as subtitle
✓ Pricing shows correctly (with strikethrough if discounted)
✓ Hover effects work smoothly
```

### 4. **Test Pagination**

```
✓ Previous/Next buttons work
✓ Click page number → page changes
✓ Current page highlighted in blue
✓ Pagination disables at start/end
✓ Page info shows "Page X of Y"
✓ Grid scrolls to top when changing pages
```

### 5. **Test States**

```
✓ Loading state - Shows skeleton cards while fetching
✓ Error state - Shows error alert if API fails
✓ Empty state - Shows message if no results
✓ Success state - Displays all mentorship cards
```

## 📁 File Structure

```
src/
├── components/student-components/mentorships/
│   ├── MentorshipCard.tsx          (Individual card)
│   ├── MentorshipGrid.tsx          (Grid layout with skeletons)
│   ├── MentorshipFilters.tsx       (Sidebar filters)
│   ├── Pagination.tsx              (Pagination controls)
│   └── index.ts                    (Exports)
│
├── pages/student-pages/
│   └── ExploreMentorships.tsx       (Main page - sidebar layout)
│
├── services/student-roleService/
│   └── ExploreMentorships.ts        (API service with React Query)
│
├── types/
│   └── mentorship.ts               (TypeScript interfaces)
│
└── App.tsx                          (Contains route: /mentorships)
```

## 🔌 API Endpoint

**Endpoint**: `GET /api/v1/mentorship/explore`

**Query Parameters**:

- `page` - 0-indexed page number (default: 0)
- `size` - Items per page (default: 12)
- `keyword` - Search term (optional)
- `category` - Filter by category (optional)
- `minPrice` - Minimum price (optional)
- `maxPrice` - Maximum price (optional)

**Example Request**:

```bash
GET http://localhost:8080/api/v1/mentorship/explore?page=0&size=12&keyword=writing&category=Academic%20Writing&minPrice=200&maxPrice=800
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response Structure**:

```json
{
  "apiResponse": {
    "mentorShips": {
      "content": [
        {
          "id": 1,
          "title": "Mastering Theses & Journals",
          "subtitle": "by Dr. Julian Aris",
          "description": "A comprehensive guide...",
          "category": "ACADEMIC WRITING",
          "mentorName": "Dr. Julian Aris",
          "price": 599.0,
          "discountPercentage": 0,
          "priceAfterDiscount": 599.0,
          "duration": 12,
          "coverImageUrl": "https://..."
        }
      ],
      "totalElements": 48,
      "totalPages": 4,
      "currentPage": 0,
      "pageSize": 12,
      "empty": false
    }
  }
}
```

## 🎯 Key Features

### Dynamic Filtering

- **Search**: Filters by keyword with 500ms debounce
- **Category**: Toggle multiple or single categories
- **Price Range**: Dual-slider input for min/max prices
- **URL Sync**: All filters saved in URL for bookmarkable results

### Performance

- **Lazy Loading**: Page loaded on-demand with code splitting
- **Caching**: React Query caches results for 5 minutes
- **Memoization**: Card components prevent unnecessary re-renders
- **Image Lazy Loading**: Images load only when visible

### User Experience

- **Skeleton Loading**: Shows placeholder cards while fetching
- **Error Handling**: Graceful error messages if API fails
- **Empty States**: Clear messaging when no results found
- **Responsive**: Adapts to mobile, tablet, and desktop screens
- **Sticky Sidebar**: Filter panel stays visible while scrolling

## 🧪 Testing Checklist

Before deploying, verify:

- [ ] Page loads without errors
- [ ] Filters are responsive and working
- [ ] Grid displays cards correctly
- [ ] Images load or show fallback
- [ ] Pagination works and updates correctly
- [ ] URL params update when filtering
- [ ] Sticky sidebar works on scroll
- [ ] Loading skeleton appears while fetching
- [ ] Error state displays correctly
- [ ] Empty state shows when no results
- [ ] Responsive design works on mobile
- [ ] Button click from CTA navigates correctly
- [ ] Auth token is sent with requests
- [ ] Price and discount calculations are correct
- [ ] Category badges display properly

## 🔧 Troubleshooting

### Issue: "Failed to resolve import"

- **Solution**: Check import paths have correct number of `../`
- Page is in `src/pages/student-pages/`, components in `src/components/student-components/`

### Issue: No data showing

- **Solution**: Verify API endpoint is correct
- Check network tab for API response
- Verify authorization token is valid

### Issue: Styles not applying

- **Solution**: Ensure Tailwind CSS is configured
- Check for CSS class conflicts
- Verify postcss.config.cjs is set up

### Issue: Images not loading

- **Solution**: Check image URLs are valid
- Verify CORS headers allow images
- Check network tab for 404 errors

## 📚 Dependencies

```json
{
  "@tanstack/react-query": "^5.90.5",
  "react-router-dom": "^7.9.4",
  "lucide-react": "^0.563.0",
  "axios": "^1.13.1",
  "tailwindcss": "^3.x"
}
```

## 🎓 Learning Resources

- **React Query Docs**: https://tanstack.com/query/latest
- **React Router Docs**: https://reactrouter.com
- **Tailwind CSS Docs**: https://tailwindcss.com
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

**Version**: 2.0 (Sidebar Layout Design)
**Status**: ✅ Production Ready
**Last Updated**: 2026-04-11
