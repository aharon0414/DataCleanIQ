# Test Data Verification Guide

## test_10_rows_known_issues.csv

### Intentional Issues (What's Wrong)

**1. DUPLICATES (1 duplicate)**
- Row 1 (order_id 1001): John Smith, Laptop, 2, $899.99
- Row 5 (order_id 1001): EXACT DUPLICATE of Row 1
- **Expected:** Row 5 should be removed

**2. MISSING VALUES (3 rows with missing email)**
- Row 2: Sarah Johnson - email is EMPTY
- Row 7: Lisa Chen - email is EMPTY  
- Row 9: Jennifer White - email is EMPTY
- **Expected:** These should be filled (not removed)

**3. OUTLIERS (1 outlier in quantity)**
- Row 3: Mike Wilson - quantity = 9999 (clearly an error)
- Normal quantities: 1-3 units
- **Expected:** Row 3 should be removed as statistical outlier

---

## Expected Transformation Results

### Starting State
- Total rows: **10**
- Columns: 9 (order_id, customer_name, email, product, quantity, price, discount_percent, status, region)

### Step 1: Remove Duplicates
- **Before:** 10 rows
- **After:** 9 rows
- **Removed:** 1 row (the duplicate at row 5)
- **Verification:** order_id 1001 should appear only ONCE

### Step 2: Fill Missing Values in 'email'
- **Before:** 9 rows
- **After:** 9 rows (count unchanged)
- **Modified:** 3 rows (rows 2, 7, 9)
- **Verification:** 
  - Check before/after samples in console
  - Email cells should now have values (not empty)
  - Most likely filled with mode (most common email pattern)

### Step 3: Remove Outliers in 'quantity'
- **Before:** 9 rows
- **After:** 8 rows
- **Removed:** 1 row (Mike Wilson with 9999 quantity)
- **Verification:** No quantity > 10 should remain

### Final State
- **Final rows:** 8
- **Total removed:** 2 (1 duplicate + 1 outlier)
- **Percentage removed:** 20%

---

## Console Log Verification Checklist

When you run this test, verify in the console:

✅ Initial state shows: 10 rows, 9 columns  
✅ Step 1 (Remove Duplicates):
   - Rows before: 10
   - Rows after: 9
   - Rows removed: 1
   - Before sample shows order_id 1001 twice
   - After sample shows order_id 1001 once

✅ Step 2 (Fill Missing Email):
   - Rows before: 9
   - Rows after: 9 (NO removal)
   - Before sample shows empty emails
   - After sample shows filled emails

✅ Step 3 (Remove Outliers):
   - Rows before: 9
   - Rows after: 8
   - Rows removed: 1
   - Before sample might show quantity 9999
   - After sample shows no quantity > 10

✅ Final summary:
   - Starting rows: 10
   - Final rows: 8
   - Total removed: 2 (20%)

---

## If Results DON'T Match Expectations

### Issue: Step 1 doesn't remove duplicate
**Problem:** Duplicate detection not working
**Check:** Are both rows truly identical? (all columns match?)

### Issue: Step 2 removes rows instead of filling
**Problem:** Fill logic is removing instead of modifying
**Check:** Look at the fill-missing.ts implementation

### Issue: Step 2 doesn't fill values
**Problem:** Fill strategy failing (likely median on text column)
**Check:** Is it trying to calculate median of email addresses?
**Fix:** Implement column type detection (numeric vs text)

### Issue: Step 3 doesn't remove outlier
**Problem:** IQR threshold too high or outlier detection broken
**Check:** Is 9999 being detected as outlier? (Should be 100% yes)

### Issue: Wrong number of final rows
**Problem:** One or more transformations not working correctly
**Action:** Check each step's before/after in console logs

---

## Quality Score Expectations

### Before Cleaning:
- **Expected score:** ~80-85 (this is relatively clean data except for the 3 issues)
- Missing values: 3/10 in email column = 30% → penalty
- Duplicates: 1/10 = 10% → penalty
- Outliers: 1/9 numeric values = ~11% → penalty

### After Cleaning:
- **Expected score:** ~95-100 (nearly perfect after fixes)
- Missing values: 0 (filled)
- Duplicates: 0 (removed)
- Outliers: 0 (removed)

If score only improves slightly (80 → 82), the fills aren't working.

---

## Success Criteria

You can trust your tool when:
1. ✅ Console logs match this guide's expectations exactly
2. ✅ Row count follows the progression: 10 → 9 → 9 → 8
3. ✅ Before/after samples show actual changes (empty → filled, duplicates → unique)
4. ✅ Quality score improves significantly (80 → 95+)

**If all 4 criteria pass:** Your transformation engine works correctly! ✅  
**If any fail:** You have clear evidence of what's broken to fix. 🔧
