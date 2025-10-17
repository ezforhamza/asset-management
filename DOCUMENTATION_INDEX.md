# Documentation Index

> All documentation files for Slash Admin

---

## 📚 Main Documentation

### 1. [claude.md](./claude.md) ⭐ **START HERE FOR AI ASSISTANTS**
**Concise SOP for Claude/AI assistants working on this project**
- Core principles & standards
- File size limits & organization
- Component templates
- Common patterns
- Import order
- Quick reference
- **Size:** ~5 KB (optimized for AI context)

### 2. [README_DOCUMENTATION.md](./README_DOCUMENTATION.md)
**Documentation index and navigation guide**
- Overview of all docs
- Quick navigation table
- Learning paths
- What each document covers

### 3. [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
**Get started in 5 minutes**
- Installation & setup
- Default credentials
- Common tasks
- Code examples
- Troubleshooting
- **Best for:** New users, quick reference

### 4. [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md)
**Complete architecture & reference (37 KB)**
- Detailed project structure
- All 10 core systems explained
- Authentication & Authorization (RBAC)
- Routing (Frontend/Backend modes)
- State Management (Zustand)
- API Layer (Axios + React-Query)
- Mock API (MSW)
- Theme System
- Internationalization (i18n)
- All components with examples
- Custom hooks & utilities
- Design patterns
- Files requiring refactoring
- Step-by-step guides
- **Best for:** Complete understanding

### 5. [CODE_STANDARDS_SOP.md](./CODE_STANDARDS_SOP.md)
**Standard Operating Procedure for clean code (18 KB)**
- File organization standards
- Component structure templates
- When to extract code
- Naming conventions
- Code quality rules
- Import organization
- Performance best practices
- Testing standards
- Git commit format
- Code review checklist
- Anti-patterns to avoid
- Refactoring workflow
- **Best for:** Maintaining quality

### 6. [COMPONENT_REFERENCE.md](./COMPONENT_REFERENCE.md)
**Visual component catalog (20 KB)**
- All 35+ shadcn/ui components
- All 15+ custom components
- Quick finder ("I need to..." → component)
- Import patterns
- Usage examples
- Component composition
- **Best for:** Component lookup

---

## 🤖 AI Tools

### Research Command
**Location:** `.claude/commands/research.md`

**Usage:** `/research [topic]`

**Examples:**
```
/research authentication system
/research form components
/research theme system
/research navigation
/research API layer
```

**Purpose:** Quickly research and summarize parts of the codebase without reading entire files.

### Research Agent
**Location:** `.claude/agents/research-agent.md`

An agent you can invoke to explore files and provide structured summaries.

---

## 📊 Quick Stats

- **Total Documentation:** 6 main files
- **Total Size:** ~100 KB
- **TypeScript Files:** 276
- **UI Components:** 35+ (shadcn/ui)
- **Custom Components:** 15+
- **Custom Hooks:** 10+

---

## 🎯 Use Cases

### "I'm new to this project"
1. Read [claude.md](./claude.md) (5 min)
2. Read [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) (10 min)
3. Explore the running app
4. Use `/research` command to learn specific parts

### "I need to understand a specific system"
1. Use `/research [system name]`
2. Check [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md) for details
3. Look at relevant files

### "I'm looking for a component"
1. Check [COMPONENT_REFERENCE.md](./COMPONENT_REFERENCE.md)
2. Search for your use case
3. Copy the example code

### "I'm about to write code"
1. Review [claude.md](./claude.md) principles
2. Check [CODE_STANDARDS_SOP.md](./CODE_STANDARDS_SOP.md) for standards
3. Follow the templates

### "I'm doing code review"
1. Use checklist in [CODE_STANDARDS_SOP.md](./CODE_STANDARDS_SOP.md) Section 12
2. Check file sizes (<200 lines)
3. Verify import organization
4. Ensure proper TypeScript usage

---

## 🔍 Finding Information

### By Topic

| Topic | Primary Doc | Secondary Doc |
|-------|-------------|---------------|
| **Quick Reference** | [claude.md](./claude.md) | [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) |
| **Architecture** | [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md) | - |
| **Authentication** | [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md#31-authentication-system) | Use `/research authentication` |
| **Routing** | [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md#33-routing-system) | Use `/research routing` |
| **Components** | [COMPONENT_REFERENCE.md](./COMPONENT_REFERENCE.md) | [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md#4-reusable-components) |
| **Code Standards** | [CODE_STANDARDS_SOP.md](./CODE_STANDARDS_SOP.md) | [claude.md](./claude.md) |
| **State Management** | [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md#34-state-management-zustand) | Use `/research state` |
| **Forms** | [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md#create-a-form) | [COMPONENT_REFERENCE.md](./COMPONENT_REFERENCE.md#form-components) |
| **API Layer** | [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md#35-api-layer-axios--react-query) | Use `/research api` |
| **Theme** | [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md#37-theme-system) | Use `/research theme` |

---

## 📖 Reading Order

### For AI Assistants
1. **[claude.md](./claude.md)** - Essential SOP (5 min)
2. Use `/research` command as needed
3. Reference other docs when needed

### For Developers
1. **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)** - Get running (10 min)
2. Explore the demo app (15 min)
3. **[claude.md](./claude.md)** - Core principles (5 min)
4. **[SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md)** - Deep dive (30-60 min)
5. **[CODE_STANDARDS_SOP.md](./CODE_STANDARDS_SOP.md)** - Before first PR (20 min)

### For Team Leads
1. **[SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md)** - Full architecture
2. **[CODE_STANDARDS_SOP.md](./CODE_STANDARDS_SOP.md)** - Establish standards
3. Review [Section 8: Files Requiring Refactoring](./SLASH_ADMIN_DOCUMENTATION.md#8-files-requiring-refactoring)
4. Set up team using [claude.md](./claude.md) as guideline

---

## 🛠️ Tools & Commands

### Research Command
```bash
/research authentication    # Learn about auth system
/research components        # See available components
/research routing          # Understand routing
/research theme            # Theme system details
/research forms            # Form components
/research api              # API layer
```

### Documentation Commands
```bash
# View docs
open QUICK_START_GUIDE.md
open SLASH_ADMIN_DOCUMENTATION.md
open claude.md

# Search docs
grep -r "authentication" *.md
grep -r "component" *.md
```

---

## 📝 Key Principles (from claude.md)

**File Organization:**
- Components: <200 lines
- Pages: <250 lines
- Hooks: <150 lines
- One responsibility per file

**Code Quality:**
- No `any` types
- Handle all states (loading, error, empty)
- Meaningful names
- Organized imports
- Early returns

**Workflow:**
1. Read claude.md principles
2. Use /research for specific info
3. Follow component templates
4. Check CODE_STANDARDS_SOP before PR

---

## 🔗 External Resources

- **Tailwind CSS:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **shadcn/ui:** [https://ui.shadcn.com](https://ui.shadcn.com)
- **Iconify:** [https://icon-sets.iconify.design](https://icon-sets.iconify.design)
- **React Query:** [https://tanstack.com/query/latest](https://tanstack.com/query/latest)
- **Zustand:** [https://zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs)

---

## 📦 Files Overview

```
Documentation/
├── claude.md                      # 5 KB  - AI SOP (START HERE for AI)
├── QUICK_START_GUIDE.md           # 13 KB - Quick start
├── SLASH_ADMIN_DOCUMENTATION.md   # 37 KB - Complete reference
├── CODE_STANDARDS_SOP.md          # 18 KB - Standards & best practices
├── COMPONENT_REFERENCE.md         # 20 KB - Component catalog
├── README_DOCUMENTATION.md        # 10 KB - Documentation index
└── DOCUMENTATION_INDEX.md         # This file

AI Tools/
├── .claude/commands/research.md   # Research command
└── .claude/agents/research-agent.md # Research agent
```

---

## 💡 Pro Tips

1. **For quick lookup:** Use [claude.md](./claude.md) (most concise)
2. **For learning:** Start with [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
3. **For reference:** Use [COMPONENT_REFERENCE.md](./COMPONENT_REFERENCE.md)
4. **For deep dive:** Read [SLASH_ADMIN_DOCUMENTATION.md](./SLASH_ADMIN_DOCUMENTATION.md)
5. **For research:** Use `/research` command
6. **For standards:** Check [CODE_STANDARDS_SOP.md](./CODE_STANDARDS_SOP.md)

---

## ✅ Summary

You now have:
- ✅ **6 comprehensive documentation files**
- ✅ **1 concise SOP for AI** (claude.md)
- ✅ **Research tools** (/research command + agent)
- ✅ **Complete architecture docs**
- ✅ **Code standards & best practices**
- ✅ **Component catalog**
- ✅ **Quick start guide**

**Everything you need to build clean, scalable admin panels!** 🚀

---

**Last Updated:** 2025-10-17
