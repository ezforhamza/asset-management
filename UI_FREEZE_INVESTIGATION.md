# UI Freeze Investigation Plan

## Executive Summary

This document provides a systematic investigation plan for diagnosing UI freeze issues in the AdminCompaniesPage after modal close + query invalidation, even when the timing is correct.

---

## PHASE 1: DOM-Level Blockers

### 1.1 Invisible Overlay Detection

**What to inspect:** DOM elements with `fixed` positioning and high z-index that remain after modal close.

**How to check:**

```javascript
// Paste in browser console WHEN UI IS FROZEN
const blockers = [...document.querySelectorAll("*")].filter((el) => {
  const style = getComputedStyle(el);
  return (
    style.position === "fixed" &&
    style.pointerEvents !== "none" &&
    el.offsetWidth > 0 &&
    el.offsetHeight > 0 &&
    parseInt(style.zIndex) >= 40
  );
});
console.table(
  blockers.map((el) => ({
    tag: el.tagName,
    class: el.className.slice(0, 50),
    zIndex: getComputedStyle(el).zIndex,
    pointerEvents: getComputedStyle(el).pointerEvents,
    display: getComputedStyle(el).display,
    opacity: getComputedStyle(el).opacity,
  }))
);
```

**What broken looks like:**

- One or more elements listed with `pointerEvents: "auto"` and covering the viewport
- Common culprits: `[data-radix-dialog-overlay]`, `[data-radix-alert-dialog-overlay]`

**Fix if confirmed:**

```css
/* Add to global.css as emergency override */
[data-radix-dialog-overlay][data-state="closed"],
[data-radix-alert-dialog-overlay][data-state="closed"] {
  pointer-events: none !important;
  display: none !important;
}
```

---

### 1.2 Orphaned Portal Detection

**What to inspect:** Portal containers that remain in DOM after modal closes.

**How to check:**

```javascript
// Check for Radix portals
const portals = document.querySelectorAll("[data-radix-portal]");
console.log("Active portals:", portals.length);
portals.forEach((p, i) => {
  console.log(`Portal ${i}:`, p.innerHTML.slice(0, 200));
});

// Check for any portal containers
const portalRoots = document.querySelectorAll(
  '[id*="radix"], [class*="portal"]'
);
console.log("Portal roots:", portalRoots);
```

**What broken looks like:**

- Portal count > 0 when no modal is open
- Portal contains overlay or dialog content

**Fix if confirmed:**
Force unmount by adding `forceMount` control or using key prop to force remount:

```tsx
<ConfirmModal
  key={toggleCompany?._id ?? "closed"} // Force remount on different company
  open={!!toggleCompany}
  // ...
/>
```

---

### 1.3 Focus Trap Leak

**What to inspect:** Active focus trap preventing clicks outside a focus zone.

**How to check:**

```javascript
// Check what element has focus
console.log("Active element:", document.activeElement);
console.log("Active element tag:", document.activeElement?.tagName);
console.log("Active element classes:", document.activeElement?.className);

// Check for aria-hidden on body children (focus trap side effect)
[...document.body.children].forEach((child) => {
  if (child.getAttribute("aria-hidden") === "true") {
    console.warn("HIDDEN CHILD:", child);
  }
});
```

**What broken looks like:**

- `aria-hidden="true"` on main content wrapper
- Focus stuck on a non-existent or hidden element

**Fix if confirmed:**

```javascript
// Emergency reset in console
document.querySelectorAll('[aria-hidden="true"]').forEach((el) => {
  el.removeAttribute("aria-hidden");
});
document.body.focus();
```

---

## PHASE 2: CSS-Level Blockers

### 2.1 Scroll Lock Leak

**What to inspect:** `overflow: hidden` on body/html preventing interaction.

**How to check:**

```javascript
console.log("Body overflow:", getComputedStyle(document.body).overflow);
console.log(
  "HTML overflow:",
  getComputedStyle(document.documentElement).overflow
);
console.log(
  "Body pointer-events:",
  getComputedStyle(document.body).pointerEvents
);
```

**What broken looks like:**

- `overflow: hidden` persists after modal close
- Radix dialogs add this and may not clean up

**Fix if confirmed:**

```javascript
// Emergency reset
document.body.style.overflow = "";
document.body.style.pointerEvents = "";
document.documentElement.style.overflow = "";
```

**Permanent fix - add cleanup useEffect:**

```tsx
// In AdminCompaniesPage.tsx
useEffect(() => {
  return () => {
    // Cleanup on unmount
    document.body.style.overflow = "";
    document.body.style.pointerEvents = "";
  };
}, []);
```

---

### 2.2 Pointer-Events Cascade

**What to inspect:** Parent element with `pointer-events: none` cascading down.

**How to check:**

```javascript
// Click anywhere and check the element under cursor
document.addEventListener(
  "click",
  (e) => {
    console.log("Clicked element:", e.target);
    console.log("Pointer events:", getComputedStyle(e.target).pointerEvents);

    // Walk up the tree
    let el = e.target;
    while (el && el !== document.body) {
      const pe = getComputedStyle(el).pointerEvents;
      if (pe === "none") {
        console.warn("BLOCKING ANCESTOR:", el, el.className);
      }
      el = el.parentElement;
    }
  },
  { capture: true }
);
```

**CSS diagnostic overlay:**

```css
/* Add temporarily to highlight pointer-events issues */
* {
  outline: 1px solid rgba(255, 0, 0, 0.1) !important;
}
*[style*="pointer-events: none"],
*:not([style*="pointer-events"]):where(
    [class*="disabled"],
    [class*="loading"]
  ) {
  outline: 3px solid red !important;
  background: rgba(255, 0, 0, 0.2) !important;
}
```

---

### 2.3 Z-Index Stacking Context Collision

**What to inspect:** Elements with same z-index creating unexpected stacking.

**How to check:**

```javascript
// Find all z-index >= 50 elements
[...document.querySelectorAll("*")]
  .filter((el) => {
    const z = parseInt(getComputedStyle(el).zIndex);
    return !isNaN(z) && z >= 50;
  })
  .forEach((el) => {
    console.log(
      `z-${getComputedStyle(el).zIndex}:`,
      el.tagName,
      el.className.slice(0, 30)
    );
  });
```

---

## PHASE 3: React State Deadlocks

### 3.1 Stale Loading State

**What to inspect:** `isPending` or `isLoading` stuck at `true`.

**How to check (React DevTools):**

1. Open React DevTools → Components tab
2. Find `AdminCompaniesPage` component
3. Check `toggleCompanyMutation` hook state
4. Look for `isPending: true` when no mutation is running

**Console check:**

```javascript
// Add to AdminCompaniesPage temporarily
useEffect(() => {
  console.log(
    "[DEBUG] toggleCompanyMutation.isPending:",
    toggleCompanyMutation.isPending
  );
}, [toggleCompanyMutation.isPending]);
```

**What broken looks like:**

- `isPending` stays `true` indefinitely after mutation completes
- Often caused by React Query state not syncing

**Fix if confirmed:**

```tsx
// Force reset mutation on modal close
const handleModalClose = useCallback(() => {
  toggleCompanyMutation.reset(); // Add this
  setToggleCompany(null);
}, [toggleCompanyMutation]);
```

---

### 3.2 Stale Modal Open State

**What to inspect:** `toggleCompany` state not clearing properly.

**How to check:**

```javascript
// Add to AdminCompaniesPage
useEffect(() => {
  console.log("[DEBUG] toggleCompany:", toggleCompany);
  console.log("[DEBUG] Modal should be:", !!toggleCompany ? "OPEN" : "CLOSED");
}, [toggleCompany]);
```

**What broken looks like:**

- `toggleCompany` is `null` but modal-related side effects persist

---

### 3.3 useEffect Cleanup Failure

**What to inspect:** `onExitComplete` timeout not clearing properly.

**Current code in ConfirmModal:**

```tsx
useEffect(() => {
  if (wasOpen.current && !open) {
    exitTimeoutRef.current = setTimeout(() => {
      onExitComplete?.();
    }, MODAL_ANIMATION_DURATION);
  }
  wasOpen.current = open;

  return () => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }
  };
}, [open, onExitComplete]);
```

**Potential issue:** If `onExitComplete` changes reference, the cleanup may not work correctly.

**Fix:**

```tsx
// Stabilize onExitComplete ref
const onExitCompleteRef = useRef(onExitComplete);
onExitCompleteRef.current = onExitComplete;

useEffect(() => {
  if (wasOpen.current && !open) {
    exitTimeoutRef.current = setTimeout(() => {
      onExitCompleteRef.current?.();
    }, MODAL_ANIMATION_DURATION);
  }
  wasOpen.current = open;

  return () => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }
  };
}, [open]); // Remove onExitComplete from deps
```

---

## PHASE 4: Radix-Specific Issues

### 4.1 AlertDialog Internal State Leak

**What to inspect:** Radix AlertDialog's internal context not cleaning up.

**How to check:**

```javascript
// Look for Radix internal attributes
document.querySelectorAll("[data-state]").forEach((el) => {
  console.log(
    el.tagName,
    el.getAttribute("data-state"),
    el.className.slice(0, 30)
  );
});
```

**What broken looks like:**

- Elements with `data-state="open"` when modal should be closed

**Fix if confirmed:**
Use controlled state more explicitly:

```tsx
<AlertDialog
  open={open}
  onOpenChange={(isOpen) => {
    if (!isOpen) {
      // Ensure cleanup
      setTimeout(() => {
        document.body.style.pointerEvents = '';
      }, 0);
    }
    handleOpenChange(isOpen);
  }}
>
```

---

### 4.2 Radix Body Pointer-Events Lock

**Root cause:** Radix sets `pointer-events: none` on body and restores it on close. If close is interrupted, it may not restore.

**How to check:**

```javascript
// Check body style attribute directly (not computed)
console.log("Body style attr:", document.body.getAttribute("style"));
```

**What broken looks like:**

- `style="pointer-events: none"` on body element

**Fix - Add defensive cleanup in ConfirmModal:**

```tsx
// In ConfirmModal.tsx
useEffect(() => {
  if (!open) {
    // Defensive cleanup when modal closes
    const cleanup = setTimeout(() => {
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";
    }, 300); // After animation
    return () => clearTimeout(cleanup);
  }
}, [open]);
```

---

## PHASE 5: Event Listener Blocking

### 5.1 Stuck Event Listeners

**How to check:**

```javascript
// Get all event listeners (Chrome DevTools only)
// Right-click element → "Event Listeners" tab

// Or programmatically check if clicks are being captured
document.addEventListener(
  "click",
  (e) => {
    console.log("Click reached document:", e.target);
  },
  { capture: true }
);

document.addEventListener("click", (e) => {
  console.log("Click bubbled to document:", e.target);
});
```

**What broken looks like:**

- Clicks are captured but never bubble
- Something is calling `e.stopPropagation()` or `e.preventDefault()`

---

## PHASE 6: Debugging Snippets

### 6.1 Master Diagnostic Script

```javascript
// Paste in console when UI freezes
(function diagnoseUIFreeze() {
  console.group("🔍 UI FREEZE DIAGNOSIS");

  // 1. Check body styles
  console.log("Body overflow:", getComputedStyle(document.body).overflow);
  console.log(
    "Body pointer-events:",
    getComputedStyle(document.body).pointerEvents
  );
  console.log("Body style attr:", document.body.getAttribute("style"));

  // 2. Check for blocking overlays
  const fixedElements = [...document.querySelectorAll("*")].filter((el) => {
    const style = getComputedStyle(el);
    return style.position === "fixed" && style.pointerEvents !== "none";
  });
  console.log("Fixed elements with pointer-events:", fixedElements.length);

  // 3. Check Radix portals
  const portals = document.querySelectorAll("[data-radix-portal]");
  console.log("Active Radix portals:", portals.length);

  // 4. Check data-state attributes
  const openStates = document.querySelectorAll('[data-state="open"]');
  console.log('Elements with data-state="open":', openStates.length);
  openStates.forEach((el) =>
    console.log(" -", el.tagName, el.className.slice(0, 40))
  );

  // 5. Check aria-hidden
  const hiddenRoots = [...document.body.children].filter(
    (c) => c.getAttribute("aria-hidden") === "true"
  );
  console.log("Hidden body children:", hiddenRoots.length);

  // 6. Check active element
  console.log(
    "Active element:",
    document.activeElement?.tagName,
    document.activeElement?.className
  );

  console.groupEnd();
})();
```

### 6.2 Emergency UI Unfreeze Script

```javascript
// Paste in console to force unfreeze
(function emergencyUnfreeze() {
  // Reset body styles
  document.body.style.overflow = "";
  document.body.style.pointerEvents = "";
  document.documentElement.style.overflow = "";

  // Remove aria-hidden from all body children
  [...document.body.children].forEach((c) => c.removeAttribute("aria-hidden"));

  // Force remove any data-state="open" on overlays
  document
    .querySelectorAll(
      "[data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]"
    )
    .forEach((el) => {
      el.style.pointerEvents = "none";
      el.style.display = "none";
    });

  // Remove orphaned portals
  document.querySelectorAll("[data-radix-portal]").forEach((p) => p.remove());

  console.log("✅ Emergency unfreeze applied");
})();
```

### 6.3 CSS Debug Overlay

```css
/* Add to global.css temporarily */
.debug-blocking-layers * {
  outline: 1px solid rgba(255, 0, 0, 0.05) !important;
}

.debug-blocking-layers [data-radix-portal] {
  outline: 3px dashed blue !important;
}

.debug-blocking-layers [data-state="open"] {
  outline: 3px solid green !important;
}

.debug-blocking-layers [style*="pointer-events"] {
  outline: 3px solid orange !important;
}
```

---

## PRIORITIZED ROOT CAUSE LIST

Based on symptoms (UI unresponsive, cursor changes, nothing clickable, fixed by refresh):

### HIGH PROBABILITY (Check First)

1. **Radix Body Pointer-Events Lock** - Radix sets `pointer-events: none` on body during open and fails to restore

   - **Check:** `document.body.getAttribute('style')`
   - **Fix:** Add defensive cleanup in ConfirmModal

2. **Orphaned Overlay in Portal** - Portal with overlay not unmounting

   - **Check:** `document.querySelectorAll('[data-radix-portal]').length`
   - **Fix:** Add `key` prop to force remount, or use `forceMount` with conditional rendering

3. **aria-hidden Leak** - Main content still marked as hidden
   - **Check:** Check body children for `aria-hidden="true"`
   - **Fix:** Remove attribute in cleanup

### MEDIUM PROBABILITY

4. **Scroll Lock Not Released** - `overflow: hidden` on body

   - **Check:** `getComputedStyle(document.body).overflow`
   - **Fix:** Explicit cleanup in useEffect

5. **Focus Trap Not Released** - Focus still trapped in unmounted modal area

   - **Check:** `document.activeElement`
   - **Fix:** Force focus to body after modal close

6. **Stale Mutation State** - `isPending` stuck true
   - **Check:** React DevTools mutation state
   - **Fix:** Call `mutation.reset()` on close

### LOW PROBABILITY

7. **Z-Index Collision** - Invisible element stacking above content
8. **Event Listener Leak** - Captured event not releasing
9. **StrictMode Double-Effect** - Cleanup running twice incorrectly

---

## RECOMMENDED IMMEDIATE FIXES

Add these changes to `ConfirmModal.tsx`:

```tsx
// Add cleanup effect
useEffect(() => {
  if (!open) {
    // Defensive cleanup after modal closes
    const cleanup = setTimeout(() => {
      // Reset any body-level locks Radix might have set
      document.body.style.pointerEvents = "";
      document.body.style.overflow = "";

      // Remove aria-hidden from sibling elements
      [...document.body.children].forEach((child) => {
        if (child.getAttribute("aria-hidden") === "true") {
          child.removeAttribute("aria-hidden");
        }
      });
    }, 300);

    return () => clearTimeout(cleanup);
  }
}, [open]);
```

And in `AdminCompaniesPage.tsx`:

```tsx
// Reset mutation state when modal closes
useEffect(() => {
  if (!toggleCompany) {
    toggleCompanyMutation.reset();
  }
}, [toggleCompany]);
```

---

## TESTING PROCEDURE

1. Open AdminCompaniesPage
2. Open browser DevTools Console
3. Paste the "Master Diagnostic Script"
4. Click Activate/Deactivate on a company
5. Confirm the action
6. **Immediately** when UI freezes, run the diagnostic script again
7. Compare before/after outputs
8. The difference reveals the stuck state
