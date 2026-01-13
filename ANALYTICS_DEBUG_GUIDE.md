# Analytics Debug Guide

## Problem
Analytics page is not showing any data even after completing workouts.

## Debug Tools Added

I've added a debug screen to help diagnose and fix the analytics issue:

### How to Access Debug Screen

1. Open the app
2. Go to the **Profile** tab (rightmost tab)
3. Scroll to "Data & Privacy" section
4. Tap on **"Debug Analytics"** (with bug icon)

### Debug Functions

The debug screen has three buttons:

#### 1. Create Sample Workout
- Creates a test workout with realistic data
- Adds 2 exercises with 3 sets each
- Sets completion times, weights, and reps
- Calculates proper totalVolume and totalSets
- **Use this to test if the database is working**

#### 2. Check Database
- Queries the database directly
- Shows:
  - Number of completed workouts
  - Details of each workout (name, sets, volume)
  - Current stats (totalWorkouts, totalSets, totalVolume, streak, PRs)
- **Use this to verify data is being saved**

#### 3. Clear Logs
- Clears the debug log output

## Testing Steps

### Step 1: Check if Database is Working

1. Go to Profile → Debug Analytics
2. Tap **"Create Sample Workout"**
3. Check the logs - you should see:
   ```
   Creating sample workout...
   Workout saved
   Found X exercises in database
   Added exercise: [name] (3 sets)
   Added exercise: [name] (3 sets)
   Sample workout created successfully!
   Stats updated: 1 workouts, 6 sets
   ```

4. Tap **"Check Database"**
5. Verify you see the workout in the logs

### Step 2: Check Home Screen

1. Go back to the **Home** tab
2. Pull down to refresh
3. **Check if stats updated:**
   - Workouts count should show 1+
   - Sets count should show 6+
   - Recent Workouts section should show the test workout

### Step 3: Check Analytics Screen

1. Go to the **Analytics** tab
2. **Check if stats appear:**
   - Top stat cards should show correct numbers
   - Workouts, Day Streak, Sets should all be > 0

### Step 4: Test Real Workout

1. Complete an actual workout:
   - Start Workout → Pick any template
   - Enter weight/reps for at least one set
   - Mark at least one set complete (tap checkmark)
   - Finish workout
2. Check if analytics updates with the new workout

## Common Issues & Fixes

### Issue: Sample workout creates but stats don't update

**Likely Cause:** `useFocusEffect` not triggering properly

**Fix:** Try manually refreshing:
- Pull down on Home screen
- Switch tabs (go to another tab and back)

### Issue: Database shows workouts but Home/Analytics shows 0

**Likely Cause:** Query issue in `getWorkoutStats()`

**Check:**
1. Go to debug screen
2. Tap "Check Database"
3. Look for the stats output
4. If stats are all 0 even though workouts exist, there's a query problem

### Issue: "ERROR: Not enough exercises in database"

**Likely Cause:** Exercise database not initialized

**Fix:** The app should seed exercises on first launch. Try:
1. Close and restart the app
2. Check logs for database initialization errors

## Files Modified for Debugging

1. `app/debug-analytics.tsx` - New debug screen
2. `app/(tabs)/profile.tsx` - Added debug option
3. `test-analytics.js` - Test utility functions

## Next Steps After Testing

Once you identify the issue using the debug tools:

1. **If sample workouts work but real workouts don't:**
   - Issue is in `workout-in-progress.tsx` completion logic
   - Check lines 241-300 where we save the workout

2. **If nothing works:**
   - Database initialization issue
   - Check `src/services/database.ts` createTables() and seedExercises()

3. **If workouts save but queries return 0:**
   - Issue in `getWorkoutStats()` query
   - Check `src/services/database.ts` lines 405-436

Let me know what you see in the debug logs and I can help fix the specific issue!
