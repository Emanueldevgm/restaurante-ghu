# File Tree: restaurante

**Generated:** 30/04/2026, 13:40:03
**Root Path:** `c:\Users\emanu\Documents\TECNOLOGIA\PROJECTOS\SG REST_GHU\restaurante`

```
├── 📁 .github
│   └── 📁 workflows
│       └── ⚙️ ci-cd.yml
├── 📁 Documentos
│   ├── 📝 BEST_PRACTICES.md
│   ├── 📄 COMPLETION_REPORT.txt
│   ├── 📝 DEPLOYMENT_GUIDE.md
│   ├── 📝 EXECUTIVE_SUMMARY.md
│   ├── 📝 IMPROVEMENTS_SUMMARY.md
│   ├── 📝 INDEX.md
│   ├── 📝 README_AUTH.md
│   ├── 📝 README_SETUP.md
│   ├── 📝 TESTING_GUIDE.md
│   ├── 📝 TROUBLESHOOTING.md
│   └── 📝 VERIFICATION_REPORT_20_04_2026.md
├── 📁 api
│   ├── 📁 database
│   │   └── 📄 schema.sql
│   ├── 📁 src
│   │   ├── 📁 config
│   │   │   ├── 📄 cors.ts
│   │   │   ├── 📄 database.ts
│   │   │   └── 📄 env.config.ts
│   │   ├── 📁 controllers
│   │   │   ├── 📄 auth.controller.ts
│   │   │   ├── 📄 delivery.controller.ts
│   │   │   ├── 📄 menu.controller.ts
│   │   │   ├── 📄 order.controller.ts
│   │   │   ├── 📄 reservation.controller.ts
│   │   │   ├── 📄 review.controller.ts
│   │   │   └── 📄 table.controller.ts
│   │   ├── 📁 middleware
│   │   │   ├── 📄 admin.middleware.ts
│   │   │   ├── 📄 auth.middleware.ts
│   │   │   ├── 📄 error.middleware.ts
│   │   │   ├── 📄 logger.middleware.ts
│   │   │   └── 📄 validation.middleware.ts
│   │   ├── 📁 routes
│   │   │   ├── 📄 auth.routes.ts
│   │   │   ├── 📄 delivery.routes.ts
│   │   │   ├── 📄 menu.routes.ts
│   │   │   ├── 📄 order.routes.ts
│   │   │   ├── 📄 reservation.routes.ts
│   │   │   ├── 📄 review.routes.ts
│   │   │   └── 📄 table.routes.ts
│   │   ├── 📁 schemas
│   │   │   └── 📄 validation.schemas.ts
│   │   ├── 📁 types
│   │   │   └── 📄 index.ts
│   │   ├── 📁 utils
│   │   │   ├── 📄 jwt.util.ts
│   │   │   ├── 📄 logger.util.ts
│   │   │   └── 📄 password.util.ts
│   │   ├── 📄 app.ts
│   │   └── 📄 server.ts
│   ├── ⚙️ .env.example
│   ├── ⚙️ .eslintrc.json
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── 📄 insert_admin_user.js
│   ├── 📄 login_and_update_item.js
│   ├── ⚙️ package.json
│   ├── 📄 seed_categories.js
│   ├── 📄 seed_items.js
│   ├── ⚙️ test.json
│   ├── 📄 test_api.js
│   ├── 📄 test_edit_error.js
│   ├── 📄 test_edit_simple.js
│   ├── ⚙️ test_item.json
│   ├── 📄 test_item_creation.js
│   ├── 📄 test_put.js
│   ├── 📄 test_put_admin.js
│   ├── ⚙️ tsconfig.json
│   └── 📄 update_admin.js
├── 📁 restaurante
│   ├── 📁 api
│   │   └── 📁 database
│   │       └── 📄 schema.sql
│   ├── 📁 public
│   │   ├── 📁 img
│   │   │   ├── 🖼️ Captura de ecrã 2026-04-19 181345.png
│   │   │   ├── 🖼️ Captura de ecrã 2026-04-19 181419.png
│   │   │   └── 🖼️ ghu.webp
│   │   ├── 🖼️ favicon.svg
│   │   ├── 🖼️ placeholder.svg
│   │   └── 📄 robots.txt
│   ├── 📁 src
│   │   ├── 📁 components
│   │   │   ├── 📁 admin
│   │   │   │   └── 📄 AdminTables.tsx
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📄 AuthForm.tsx
│   │   │   │   └── 📄 ProtectedRoute.tsx
│   │   │   ├── 📁 cart
│   │   │   │   └── 📄 CartDrawer.tsx
│   │   │   ├── 📁 checkout
│   │   │   │   └── 📄 AddressSelector.tsx
│   │   │   ├── 📁 dashboard
│   │   │   │   ├── 📁 cliente
│   │   │   │   │   ├── 📄 Overview.tsx
│   │   │   │   │   └── 📄 pedidos.tsx
│   │   │   │   ├── 📁 modals
│   │   │   │   │   ├── 📄 OrderDetailsModal.tsx
│   │   │   │   │   └── 📄 ReservationDetailsModal.tsx
│   │   │   │   ├── 📄 AdminDashboard.tsx
│   │   │   │   ├── 📄 AdminMenu.tsx
│   │   │   │   ├── 📄 AdminOrders.tsx
│   │   │   │   ├── 📄 AdminReservations.tsx
│   │   │   │   ├── 📄 AdminTables.tsx
│   │   │   │   ├── 📄 ClientDashboard.tsx
│   │   │   │   └── 📄 ClienteDashboard.tsx
│   │   │   ├── 📁 layout
│   │   │   │   ├── 📄 DashboardLayout.tsx
│   │   │   │   ├── 📄 Footer.tsx
│   │   │   │   └── 📄 Navbar.tsx
│   │   │   ├── 📁 menu
│   │   │   │   ├── 📄 MenuShowcase.tsx
│   │   │   │   └── 📄 ProductCard.tsx
│   │   │   ├── 📁 reservation
│   │   │   │   ├── 📄 ReservationDialog.tsx
│   │   │   │   └── 📄 TableGrid.tsx
│   │   │   ├── 📁 sections
│   │   │   │   ├── 📄 About.tsx
│   │   │   │   ├── 📄 Features.tsx
│   │   │   │   ├── 📄 Hero.tsx
│   │   │   │   └── 📄 Testimonials.tsx
│   │   │   ├── 📁 ui
│   │   │   │   ├── 📄 accordion.tsx
│   │   │   │   ├── 📄 alert-dialog.tsx
│   │   │   │   ├── 📄 alert.tsx
│   │   │   │   ├── 📄 aspect-ratio.tsx
│   │   │   │   ├── 📄 avatar.tsx
│   │   │   │   ├── 📄 badge.tsx
│   │   │   │   ├── 📄 breadcrumb.tsx
│   │   │   │   ├── 📄 button.tsx
│   │   │   │   ├── 📄 calendar.tsx
│   │   │   │   ├── 📄 card.tsx
│   │   │   │   ├── 📄 carousel.tsx
│   │   │   │   ├── 📄 chart.tsx
│   │   │   │   ├── 📄 checkbox.tsx
│   │   │   │   ├── 📄 collapsible.tsx
│   │   │   │   ├── 📄 command.tsx
│   │   │   │   ├── 📄 context-menu.tsx
│   │   │   │   ├── 📄 dialog.tsx
│   │   │   │   ├── 📄 drawer.tsx
│   │   │   │   ├── 📄 dropdown-menu.tsx
│   │   │   │   ├── 📄 form.tsx
│   │   │   │   ├── 📄 hover-card.tsx
│   │   │   │   ├── 📄 input-otp.tsx
│   │   │   │   ├── 📄 input.tsx
│   │   │   │   ├── 📄 label.tsx
│   │   │   │   ├── 📄 menubar.tsx
│   │   │   │   ├── 📄 navigation-menu.tsx
│   │   │   │   ├── 📄 pagination.tsx
│   │   │   │   ├── 📄 popover.tsx
│   │   │   │   ├── 📄 progress.tsx
│   │   │   │   ├── 📄 radio-group.tsx
│   │   │   │   ├── 📄 resizable.tsx
│   │   │   │   ├── 📄 scroll-area.tsx
│   │   │   │   ├── 📄 select.tsx
│   │   │   │   ├── 📄 separator.tsx
│   │   │   │   ├── 📄 sheet.tsx
│   │   │   │   ├── 📄 sidebar.tsx
│   │   │   │   ├── 📄 skeleton.tsx
│   │   │   │   ├── 📄 slider.tsx
│   │   │   │   ├── 📄 sonner.tsx
│   │   │   │   ├── 📄 switch.tsx
│   │   │   │   ├── 📄 table.tsx
│   │   │   │   ├── 📄 tabs.tsx
│   │   │   │   ├── 📄 textarea.tsx
│   │   │   │   ├── 📄 toast.tsx
│   │   │   │   ├── 📄 toaster.tsx
│   │   │   │   ├── 📄 toggle-group.tsx
│   │   │   │   ├── 📄 toggle.tsx
│   │   │   │   ├── 📄 tooltip.tsx
│   │   │   │   └── 📄 use-toast.ts
│   │   │   ├── 📄 AccessTracker.tsx
│   │   │   ├── 📄 ErrorBoundary.tsx
│   │   │   ├── 📄 Logo.tsx
│   │   │   ├── 📄 NavLink.tsx
│   │   │   └── 📄 ReviewForm.tsx
│   │   ├── 📁 contexts
│   │   │   ├── 📄 AccessLogContext.tsx
│   │   │   ├── 📄 AuthContext.tsx
│   │   │   └── 📄 CartContext.tsx
│   │   ├── 📁 data
│   │   ├── 📁 hooks
│   │   │   ├── 📄 use-mobile.tsx
│   │   │   ├── 📄 use-restaurant.ts
│   │   │   ├── 📄 use-toast.ts
│   │   │   ├── 📄 useApi.ts
│   │   │   └── 📄 useDeliveryFee.ts
│   │   ├── 📁 lib
│   │   │   └── 📄 utils.ts
│   │   ├── 📁 pages
│   │   │   ├── 📄 About.tsx
│   │   │   ├── 📄 Admin.tsx
│   │   │   ├── 📄 Auth.tsx
│   │   │   ├── 📄 Cliente.tsx
│   │   │   ├── 📄 Cozinha.tsx
│   │   │   ├── 📄 Entregador.tsx
│   │   │   ├── 📄 Garcom.tsx
│   │   │   ├── 📄 Gerente.tsx
│   │   │   ├── 📄 Index.tsx
│   │   │   ├── 📄 Menu.tsx
│   │   │   ├── 📄 NotFound.tsx
│   │   │   └── 📄 Reservas.tsx
│   │   ├── 📁 schemas
│   │   │   └── 📄 validation.schemas.ts
│   │   ├── 📁 services
│   │   │   └── 📄 api.ts
│   │   ├── 📁 test
│   │   │   ├── 📄 example.test.ts
│   │   │   └── 📄 setup.ts
│   │   ├── 📁 types
│   │   │   └── 📄 restaurant.ts
│   │   ├── 📁 utils
│   │   │   └── 📄 adapters.ts
│   │   ├── 🎨 App.css
│   │   ├── 📄 App.tsx
│   │   ├── 🎨 index.css
│   │   ├── 📄 main.tsx
│   │   └── 📄 vite-env.d.ts
│   ├── ⚙️ .env.example
│   ├── ⚙️ .gitignore
│   ├── 📝 README.md
│   ├── ⚙️ components.json
│   ├── 📄 eslint.config.js
│   ├── 🌐 index.html
│   ├── ⚙️ package.json
│   ├── 📄 postcss.config.js
│   ├── 📄 tailwind.config.ts
│   ├── ⚙️ tsconfig.app.json
│   ├── ⚙️ tsconfig.json
│   ├── ⚙️ tsconfig.node.json
│   ├── 📄 vite.config.ts
│   └── 📄 vitest.config.ts
├── ⚙️ .gitignore
├── ⚙️ .prettierrc
├── 📝 README.md
├── ⚙️ docker-compose.yml
├── 📄 setup.sh
├── 📄 setup_auth.sh
└── ⚙️ test.json
```

---
*Generated by FileTree Pro Extension*