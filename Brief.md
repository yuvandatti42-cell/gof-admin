BRIEF.MD — Build Godavari Organic Foods Admin Panel (Frontend Only)
Mission
Build a complete, high-quality frontend-only admin panel for the existing Godavari Organic Foods e-commerce website.

The customer storefront has already been built. This is a separate admin interface for managing a simulated store experience. In this phase, implement only the frontend and client-side interactions. Backend and database integration will be handled later.

Read DESIGN.MD first and follow it as the visual and interaction specification.
Non-negotiable scope rules
1. Frontend only. Use realistic mock data and client-side state.
2. Do not add a backend, database, API routes, server actions, Firebase/Supabase, authentication provider, payment gateway, or real order processing.
3. Do not rebuild or modify the existing customer-facing e-commerce site.
4. Do not claim sample metrics, products, customers, or orders are live data. Show a clear “Demo data” indicator.
5. Build a cohesive multi-page application, not a single static dashboard mockup.
6. Every visible interactive control must work, or be clearly marked as unavailable/coming later.
7. Use Indian rupee formatting (₹) and realistic fictional Indian organic-food product examples.
8. Do not stop after creating the dashboard overview. Implement all required pages and the shared application shell.
Step 1 — Inspect before coding
- Inspect the current workspace, existing files, package configuration, routes, and available assets.
- If this is an existing repository, preserve its conventions and avoid overwriting unrelated work.
- If this is a new/empty repository, set up a modern frontend using the tools available in the environment. Prefer React + TypeScript + Vite unless the existing project already uses another suitable frontend framework.
- Use the package manager already established by the repository; if there is no existing convention, use npm.
- Reuse existing brand assets only when they are genuinely available. Do not fabricate an official logo.
- Do not ask the user to configure a backend for this phase.
Step 2 — Choose an appropriate frontend stack
For a new React/TypeScript project, prefer:
- React + TypeScript.
- Vite.
- Tailwind CSS or the styling approach already present in the repository.
- React Router (or existing router) for page navigation.
- Lucide React for icons.
- Recharts (or another already-installed chart library) for interactive charts.
- A lightweight toast/dialog implementation, or existing UI primitives.
- Local component state and a typed mock-data module.
Install only dependencies that are actually needed. Avoid adding multiple libraries that duplicate the same functionality. If a preferred dependency cannot be installed, use an existing equivalent and keep the app runnable.
Step 3 — Build the shared application shell
Implement:
- Responsive sidebar with Godavari Organic Foods wordmark/text and navigation.
- Active navigation styling.
- Sidebar collapse/expand on desktop.
- Mobile navigation drawer.
- Header with current page title, search affordance, notifications popover, and profile menu.
- Reusable page container, cards, tables, status badges, buttons, form controls, dropdowns, dialogs/drawers, confirmation dialog, and toast feedback.
- A consistent typography, spacing, color, border, radius, and shadow system from DESIGN.MD.
Navigation destinations:
- Dashboard
- Products
- Categories
- Orders
- Customers
- Promotions
- Store Content
- Settings
Use proper routes if the project already uses a router or if it is easy to add. Refreshing a route should not break the application.
Step 4 — Implement all pages
A. Dashboard
- Welcome heading and “Demo data” indicator.
- Date-range selector: 7 days, 30 days, 90 days.
- KPI cards: total revenue, orders, products, customers.
- Interactive revenue-over-time chart.
- Order status chart/breakdown.
- Recent orders table.
- Best-selling products list.
- Buttons linking to Add Product and Orders.
B. Products
- Product table with thumbnails, name, SKU, category, price, stock, status, updated date, and row actions.
- Search, category filter, stock filter, and sorting.
- Add Product and Edit Product form/modal.
- Fields: name, SKU, category, description, price, optional compare-at price, stock, unit/weight, status, featured flag, image URL/local preview.
- Form validation and helpful inline errors.
- View, edit, duplicate, and delete actions; delete requires confirmation.
- Changes update local React state and reflect immediately in the table and dashboard where relevant.
- Use a typed mock dataset with a range of stock states.
C. Categories
- Searchable category list/grid.
- Add/edit category form.
- Category name, description, optional image URL, visibility.
- Product counts derived from mock product state where practical.
- Delete confirmation and empty state.
D. Orders
- Summary counts by order status.
- Search by order ID/customer.
- Filters for order status, payment status, and date.
- Order table with ID, customer, date, item count, amount, payment status, order status, and actions.
- Order detail drawer/page containing fictional customer/shipping details, items, pricing breakdown, payment method, timeline, and a demo internal note.
- Allow order status updates in client-side state.
- Show a toast when an update succeeds.
- No real payments, refunds, shipping integrations, emails, or backend processing.
E. Customers
- Searchable customer directory.
- Name, email, phone, order count, total spend, joined date, and status.
- Customer detail drawer/page with mock order history.
- Use fictional sample data only.
F. Promotions
- List coupon code, discount type/value, usage count, validity dates, and status.
- Add/edit promotion form with validation.
- Percentage and fixed-amount discount types.
- Toggle active/inactive locally.
- No real discount application to the storefront.
G. Store Content
- Editable mock homepage headline and supporting copy.
- Hero image URL with image preview.
- Featured products selector.
- Promotional banner title/text/CTA.
- Trust/quality highlight editor.
- Preview action opens a storefront-style modal or pane.
- Saving updates only the local frontend preview; it must not modify the existing live storefront.
H. Settings
- Store profile fields.
- Store appearance/logo preview and restricted brand accent selection.
- Mock notification preferences.
- Admin profile fields.
- Currency/date-format/table-density preferences.
- Persistent note that changes are local to this preview.
- Do not implement real credentials, secrets, or server configuration.
Step 5 — Make the prototype genuinely interactive
Create a typed, centralized mock-data layer and reusable state/actions where practical.

Requirements:
- Search updates the displayed list.
- Filters and sorting actually affect results.
- Pagination works if implemented; do not add fake pagination controls.
- Add/edit forms validate and update state.
- Cancel closes forms without applying changes.
- Delete uses a confirmation dialog.
- Order status dropdown updates the selected order.
- Dashboard lists and counts stay consistent with local product/order state where practical.
- Toasts communicate successful and invalid actions.
- Empty states provide a clear recovery action.
- Dropdowns/popovers/dialogs close appropriately and are keyboard accessible.
- Use stable IDs, not array indices, as entity identifiers.
- No real network calls or hidden backend dependencies.
Local persistence via localStorage is optional. If used, keep it simple, handle malformed stored data safely, and include a reset-demo-data action. Do not use localStorage as a substitute for future backend architecture.
Step 6 — Accessibility and responsive layout
Follow DESIGN.MD and verify desktop, tablet, and mobile layouts. At minimum check:
- 1440×900
- 1280×800
- 768×1024
- 390×844
- 360×800
Include semantic headings, labels for form fields, accessible names for icon buttons, visible keyboard focus, usable keyboard navigation, dialog labels, sufficient contrast, and touch-friendly controls.

Prevent:
- Content hiding behind the sidebar/header.
- Horizontal page overflow on mobile.
- Clipped dialogs and dropdowns.
- Charts or tables extending beyond their containers.
- Tiny or inaccessible action buttons.
Step 7 — Visual quality requirements
- Match the premium organic brand direction: forest green, warm cream, white, and restrained earthy accents.
- Use consistent spacing and a strong typographic hierarchy.
- Use Lucide icons, not emoji icons.
- Keep charts, tables, filters, and forms visually coherent.
- Avoid generic gradient-heavy AI dashboard styling.
- Avoid excessive animations and unnecessary decoration.
- Use polished hover, focus, active, disabled, loading, empty, and confirmation states.
- Format money with Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }) or an equivalent consistent formatter.
- Ensure the dashboard feels like a credible store operations product rather than a static template.
Step 8 — Run and verify
Before finishing:
1. Run the available type checks, lint, and production build scripts.
2. Fix errors caused by the implementation.
3. Launch the app using the repository's expected development command.
4. Verify that every sidebar destination works.
5. Exercise Add/Edit/Delete product, category, and promotion flows.
6. Exercise search and filters on Products, Orders, and Customers.
7. Exercise order detail and order-status update flows.
8. Verify mobile sidebar/drawer and modal behavior.
9. Confirm the app contains no backend/API/database/auth/payment integration.
10. Confirm unrelated files and the customer storefront were not modified.
Final handoff
When done, provide a concise summary of:
- Pages and interactions implemented.
- Frontend stack used.
- Commands to run the app.
- Build/type-check status.
- Any remaining frontend limitations.
Do not say the admin panel is connected to the live store. Clearly state that it currently runs on mock data and client-side state.