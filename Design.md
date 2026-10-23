DESIGN.MD — Godavari Organic Foods Admin Panel
1. Product vision
Design a polished, responsive, premium admin dashboard for Godavari Organic Foods, an existing organic-food e-commerce store.

This is a frontend-only phase. Build the admin experience using mock/sample data and client-side state. Do not implement a backend, database, API, authentication provider, payment integration, or real order processing yet.

The customer-facing e-commerce website already exists. This project is its separate admin interface. Do not rebuild, replace, or modify the customer storefront.
2. Visual direction
Brand personality
- Organic, trustworthy, fresh, modern, premium, calm.
- Professional business dashboard first; subtle organic character second.
- Avoid a generic AI-generated dashboard look, excessive gradients, oversized decorative illustrations, glassmorphism, and unnecessary animation.
Palette
Use design tokens and keep the palette consistent:
- Forest green: #245C3A — primary actions and active navigation.
- Deep green: #173D2A — headings and dark sidebar details.
- Leaf green: #6F9F62 — supporting accents.
- Warm cream: #F7F6EF — page background.
- White: #FFFFFF — cards, forms, tables.
- Main text: #202820.
- Muted text: #737B72.
- Border: #E5E8DF.
- Success: #2F7D4A; warning: #B7791F; danger: #B64238; info: #356AA0.
Use status colors sparingly and ensure accessible contrast. Avoid making every component green.
Typography
- Use Inter or DM Sans for dashboard UI.
- Clear hierarchy: compact page eyebrow if useful, 26–30px page title, 14–16px body, 12–13px table metadata.
- Use tabular numerals for money, counts, and chart labels.
- Keep line lengths comfortable and table rows easy to scan.
Layout
- Desktop: fixed/collapsible left sidebar around 248px, top header, scrollable main content.
- Main content max width around 1440px with 24–32px padding.
- Use a 12-column or responsive grid. KPI cards should align evenly.
- Cards: white background, thin neutral border, 12–16px radius, subtle shadow only where useful.
- Tables: clear headers, consistent row heights, subtle dividers, hover states, and enough whitespace.
- Mobile: sidebar becomes a drawer, header controls remain accessible, KPI cards become a 2-column grid where space permits, tables use a deliberate horizontal-scroll or stacked-card treatment.
- Do not let content sit beneath fixed navigation or overflow the viewport.
3. App shell
Sidebar
Brand area:
- A clean text-based wordmark reading Godavari Organic Foods.
- Use a simple leaf mark only if available from an existing project asset; do not invent or distort an official logo.
- Small “ADMIN” or “STORE MANAGEMENT” label.
- Sidebar navigation with icons and labels:
  1. Dashboard
  2. Products
  3. Categories
  4. Orders
  5. Customers
  6. Promotions
  7. Store Content
  8. Settings
- Active item has a light green background, strong text, and a restrained left indicator.
- Bottom area: admin avatar/initials, “Store Admin”, “Frontend preview”, and a working collapse/expand control on desktop.
- On mobile, show an accessible drawer and close it after choosing a page.
Top header
- Current page title/breadcrumb.
- Search control with a useful visual affordance. It may search the current mock dataset where implemented.
- Notification icon with a small sample unread indicator; clicking opens a popover.
- Admin profile menu with profile/preferences and a demo-only sign-out action that returns to a mock login screen if a login screen is included.
- Responsive menu toggle on mobile.
4. Dashboard page
Welcome area
- Greeting such as “Good morning, Store Admin”.
- Supporting text: “Here’s what’s happening with your store today.”
- Date range selector with options such as 7 days, 30 days, and 90 days. It changes the displayed mock chart/KPI state where practical.
- Primary action: “Add product”.
- Secondary action: “View orders”.
KPI cards
Use realistic, clearly demo-only values:
- Total revenue
- Orders
- Products
- Customers
  Each card includes a small icon, value, period comparison, and restrained trend indicator. Do not imply that the values are live store data. Include a visible “Demo data” or “Sample data” note.
Sales analytics
- A clean responsive line/area chart for revenue over time, with a tooltip if the chosen chart library supports it.
- Range control consistent with the dashboard date filter.
- Order breakdown by status using a donut or horizontal bar chart.
- Provide a helpful empty state if the chart library cannot render or data is empty.
Recent orders
Columns: Order ID, Customer, Date, Amount, Payment, Fulfilment/Order status, action.
- Statuses use readable text plus soft badges.
- Clicking an order opens its details drawer or detail view.
- “View all orders” navigates to Orders.
Best-selling products
Show product thumbnail, product name/category, units sold, stock level, and price. “View products” navigates to Products.
5. Products page
- Page title and explanatory subtitle.
- “Add product” primary button opens a usable modal or form page.
- Search by name or SKU.
- Filters for category and stock status.
- Sort by name, price, stock, or recently added.
- Bulk selection may be visual-only unless implemented with client state.
- Table columns: checkbox, image, product name/SKU, category, price, stock, status, updated date, actions.
- Row actions: View, Edit, Duplicate (client-side only), Delete with confirmation.
- Add/Edit form fields: product name, SKU, category, short description, price (₹), compare-at price (optional), stock quantity, unit/weight, status, featured toggle, image URL or local preview.
- Validate required fields and non-negative numeric values.
- For the frontend phase, image upload can use a local preview via browser file input if supported; do not upload to a server.
- Save changes in client-side state so the prototype feels interactive. Show a toast for success/error.
- Use mock products appropriate to an Indian organic-food store, e.g. organic rice, cold-pressed groundnut oil, millets, jaggery, pulses, spices, and honey. Label all sample content as demo data.
- Empty state includes “No products found”, explanation, clear filters, and Add product CTA.
6. Categories page
- List/grid of categories with name, product count, visibility, and actions.
- Add/Edit category modal with name, description, optional image URL, and visibility.
- Search and sort.
- Delete confirmation should explain that this is only a demo and should not silently delete products.
- All actions are client-side only.
7. Orders page
- Summary strip: all orders, pending, processing, delivered, cancelled.
- Search by order ID or customer.
- Filters: order status, payment status, and date range.
- Table columns: Order ID, customer, order date, items, total, payment status, order status, actions.
- Selecting a row opens an order details drawer or page with:
  - Customer and shipping details using fictional sample data.
  - Items, quantity, unit price, subtotal, delivery charge, discount, total.
  - Payment method and status.
  - Timeline/status steps.
  - Internal note field (demo-only).
  - Status update dropdown that updates local state and shows a toast.
- Include a confirmation for destructive or cancellation actions.
- Do not implement real payments, refunds, emails, shipping labels, or order fulfilment.
8. Customers page
- Searchable, filterable customer table.
- Columns: customer name, email, phone, total orders, total spent, joined date, status.
- Selecting a customer opens a detail panel with summary and mock order history.
- Use obviously fictional sample identities and phone/email values. Do not use actual customer data.
- Any edit or status change is a local prototype interaction only.
9. Promotions page
- Promotion/coupon list with code, type, value, usage count, start/end dates, status.
- Add/Edit promotion form with validation.
- Support sample percentage and fixed-amount coupon types.
- Include a simple active/inactive toggle in local state.
- Do not calculate or apply real discounts on the existing storefront.
10. Store Content page
Create frontend-only management screens for:
- Homepage hero headline and supporting text.
- Hero image URL with preview.
- Featured products selection.
- Promotional banner title, text, and CTA label.
- Trust/quality highlights.
- Preview button opens a storefront-style preview modal or pane.
- Save updates only the local preview state. It must not change the live customer website.
11. Settings page
Use clear sections or tabs:
- Store profile: store name, support email/phone, address.
- Store appearance: logo preview, accent color selector restricted to the brand palette.
- Notifications: mock toggles.
- Admin profile: name and email fields.
- Preferences: currency set to INR (₹), date format, table density.
- Show a persistent explanatory note: “Settings are saved only in this frontend preview.”
- No real credential management, server settings, payment gateway setup, or secrets.
12. Interaction and component states
Every visible control must have a meaningful behavior:
- Sidebar navigation changes pages.
- Search filters the relevant mock list.
- Filters and sorting update displayed data.
- Buttons open their intended page, modal, drawer, popover, or toast.
- Forms validate input and save to local UI state.
- Cancel closes without saving.
- Delete requires confirmation.
- Dropdowns open and are keyboard accessible.
- Tabs switch content.
- Notification popover opens and closes.
- Mobile navigation opens and closes correctly.
- Loading, empty, error, success, and disabled states are designed where relevant.
- Use accessible labels, visible focus rings, semantic buttons, keyboard navigation, and proper dialog focus handling.
Do not leave buttons that look functional but do nothing. If a feature is intentionally out of scope, mark it “Coming later” or disable it with a clear explanation.
13. Responsive behavior
Test at minimum:
- Desktop: 1440×900 and 1280×800.
- Tablet: 768×1024.
- Mobile: 390×844 and 360×800.
Ensure:
- No horizontal overflow on page layouts.
- Forms stack on narrow screens.
- Modal/drawer content fits within the viewport.
- Table actions remain reachable.
- Charts resize without clipping.
- Tap targets are comfortably sized.
- Mobile navigation and top-bar actions are usable.
14. Quality bar
The result should look like a real, thoughtfully art-directed commerce operations tool:
- Consistent spacing and alignment.
- No emoji used as a substitute for UI icons.
- Use one consistent icon library, preferably Lucide.
- No random gradients or decorative blobs.
- Avoid oversized KPI cards or excessive empty space.
- Use real chart components rather than static chart screenshots.
- Provide realistic Indian currency formatting (₹1,24,500).
- Maintain coherent status labels and sample data across pages.
- Use polished skeleton/empty states where appropriate.
- Keep visual effects subtle and fast.
15. Definition of done
- All pages in the sidebar render and navigate.
- Main flows work with mock data.
- Product/category/promotion forms validate and update local state.
- Order status changes update the UI.
- Search and filters work on relevant lists.
- Layout is responsive at the specified viewport sizes.
- No backend/API/database/auth/payment integration has been added.
- Existing customer-facing store has not been modified.
- App clearly indicates that displayed information and actions are a frontend demo.