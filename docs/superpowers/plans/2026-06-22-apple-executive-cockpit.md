# Apple Executive Cockpit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing Phase 0 shell into a polished Apple-like executive command center for Startup OS Personal.

**Architecture:** Keep the current React + Vite shell and improve it through focused component edits, richer seed data, and a stronger shared CSS system. No backend behavior changes are included; this is a UI/UX redesign prepared for future Google data.

**Tech Stack:** React 18, TypeScript, React Router, lucide-react, CSS, Vitest, Testing Library.

---

## File Structure

- Modify `apps/web/src/__tests__/App.test.tsx`: add expectations for the redesigned cockpit and quick-create modal.
- Modify `apps/web/src/components/layout/Sidebar.tsx`: refine brand, nav, Google connection card, user footer.
- Modify `apps/web/src/components/layout/Topbar.tsx`: add command-style search and improved action buttons.
- Modify `apps/web/src/components/quick-create/QuickCreateModal.tsx`: add icon-driven action anatomy.
- Modify `apps/web/src/components/ui/Badge.tsx`: support dot badges and neutral semantic tones.
- Modify `apps/web/src/components/ui/MetricCard.tsx`: support icons, trend text and richer metric anatomy.
- Modify `apps/web/src/pages/DashboardPage.tsx`: build the executive cockpit using seed data and focused panels.
- Modify `apps/web/src/pages/PlaceholderPage.tsx`: make module placeholders feel like real product surfaces.
- Modify `apps/web/src/pages/SettingsPage.tsx`: improve Google/setup diagnostics UI.
- Modify `apps/web/src/styles/global.css`: replace the current visual system with the Apple Executive Cockpit tokens and responsive rules.

### Task 1: Red Test For Redesigned Shell

- [ ] Update `apps/web/src/__tests__/App.test.tsx` with assertions for `Hoy`, `Tareas críticas`, `Funnel abierto`, `Agenda de hoy`, `Siguientes acciones`, `Google no conectado`, and rich quick-create options.
- [ ] Run `npm run test --workspace apps/web`; expected result: fail because the existing dashboard does not render the new cockpit labels.

### Task 2: Implement Core Layout And Components

- [ ] Update `Sidebar.tsx`, `Topbar.tsx`, `Badge.tsx`, `MetricCard.tsx`, and `QuickCreateModal.tsx` to expose the new UI anatomy.
- [ ] Keep props small and compatible with current usage.
- [ ] Use lucide icons already available in the project.

### Task 3: Implement Dashboard Cockpit

- [ ] Replace the current `DashboardPage.tsx` with seeded executive panels: KPI strip, priorities, projects, agenda, funnel, invoices, next actions, recent activity, and quick actions.
- [ ] Ensure every visible label supports the future Google-backed data model.

### Task 4: Upgrade Secondary Screens

- [ ] Update `PlaceholderPage.tsx` with a polished module overview, subview tabs, seed rows, and next actions.
- [ ] Update `SettingsPage.tsx` with Google connection, initialization, template IDs and diagnostics panels.

### Task 5: Replace Styling System

- [ ] Rewrite `global.css` around design tokens, refined app shell layout, reusable panel/table/list styles, modal polish, hover/focus states and responsive breakpoints.
- [ ] Avoid nested cards, oversized radii, decorative blobs, dark-only UI, beige palette or purple-dominant palette.

### Task 6: Verify

- [ ] Run `npm run test --workspace apps/web`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
- [ ] Start `npm run dev`, inspect desktop and mobile in browser, capture screenshots, compare against `docs/design/apple-executive-cockpit-concept.png`.
