# Workflow & Development Rules for FreePythonCompiler

## 1. Branching & Git Protocol (Strict)
- **Always Branch First**: Before writing, modifying, or testing any code, ALWAYS create and switch to a dedicated feature/fix branch (e.g., `git checkout -b feature/<descriptive-name>`).
- **NEVER Push to `main` Directly**: Under no circumstances should code be committed or pushed directly to `main` without explicit user permission.
- **Verification First**: After completing all changes on the branch, run local servers, test all links and features, and present the results to the user for manual inspection.
- **Manual User Approval Required**: Only merge or push to `main` when the user explicitly and manually commands to push to main.

## 2. Programmatic SEO Architecture
- **No Programmatic Links in Global Navigation/Footers**: Programmatic SEO landing pages (e.g. library compilers, IDE alternatives, query-specific pages) must **NEVER** be added to global footers, site headers, or global menus.
- **Scalable Discovery Only**: Programmatic pages must be indexed strictly via:
  1. `frontend/sitemap.xml`
  2. `frontend/llms.txt` and `frontend/llms-full.txt`
  3. Structured JSON-LD breadcrumb hierarchy (`BreadcrumbList` schema)
  4. Contextual in-content links where relevant.
- **Global Footers**: Global footers must strictly maintain only the 3 Core Product Pillars:
  - Python Compiler (`/python-compiler`)
  - HTML/CSS/JS Compiler (`/html-compiler`)
  - Features & Engine (`/features`)
