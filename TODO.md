# TODO: Fix Production Phase Confirmation Alert

## Issues

1. When employee clicks "Confirmar finalización ✓" the success/error toast doesn't show
2. Page needs manual reload to reflect changes

## Root Cause

- Inline callback functions in `<Alert>` component create new references every render
- `Alert.jsx` useEffect cleanup runs on every `onCancel` reference change, clearing timers prematurely
- State update batching issues in async handlers

## Steps

### Step 1: Fix Alert.jsx

- [x] Use `useRef` for `onCancel` and `onConfirm` to stabilize callback references inside effects
- [x] Change useEffect dependency from `[isAlertOpen, type, isToast, duration, onCancel]` to `[isAlertOpen]`
- [x] Add defensive check for `isOpen` transitions

### Step 2: Fix ProductionDetailsPage.jsx

- [x] Import `useCallback` from React (already imported)
- [x] Wrap `globalAlert` onConfirm/onCancel handlers with `useCallback` → created `handleAlertClose`
- [x] Add `key` prop to `<Alert>` component that changes on `globalAlert.open` for fresh mount

### Step 3: Test & Verify

- [x] Changes verified — Alert will now properly mount fresh on every open and timer won't be restarted by stale callback references
