# WorkoutBuilder Pro

**Beautiful workout tracking for serious lifters.**

WorkoutBuilder Pro combines premium visual design with professional-grade tracking capabilities. Build custom programs, log workouts with intelligent timers, and watch your strength gains come alive through gradient-filled analytics.

---

## Features

### 🎨 Premium Design
- Dark theme with bold gradients
- Smooth 60fps animations
- Haptic feedback throughout
- Modern 2026 design language

### 💪 Powerful Tracking
- Unlimited custom workout programs (Pro)
- 500+ exercise library with animated demos
- Real-time workout logging with rest timer
- Personal record tracking with celebrations

### 📊 Beautiful Analytics
- Gradient-filled progress charts
- Volume heatmaps by muscle group
- Achievement animations
- Comprehensive workout history

### 🔒 Privacy First
- All data stored locally (SQLite)
- No account required
- Export data anytime (CSV, PDF)
- Offline-first architecture

---

## Tech Stack

- **Framework**: React Native with Expo SDK 54+
- **Navigation**: Expo Router v4 (file-based routing)
- **Language**: TypeScript
- **Database**: SQLite (expo-sqlite)
- **Subscriptions**: RevenueCat
- **Analytics**: Firebase Analytics (optional, opt-out available)
- **Styling**: Custom design system with LinearGradient

---

## Getting Started

### Prerequisites
- Node.js 18+ installed
- iOS Simulator or Android Emulator
- Expo Go app (for physical device testing)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### First Time Setup

1. The app will initialize the database on first launch
2. Default exercise library will be seeded automatically
3. No account or login required—start using immediately

---

## How to Use the App

### 🏠 Home Screen (Dashboard)

The home screen is your workout hub showing:
- **Quick Stats**: Total workouts, workout streak, and sets completed
- **Recent Workouts**: Your last completed workouts (tap any workout to view full details)
- **Quick Start Button**: Jumps straight into an empty workout

**Viewing Workout Details**:
1. Tap any workout card in "Recent Workouts"
2. View complete workout breakdown including:
   - Workout name, date, and time
   - Duration, total sets, and volume
   - All exercises performed with set-by-set data
   - Weight, reps, and volume per set
   - Exercise totals

### 💪 Starting a Workout

**Option 1: Start from Template**
1. Go to the **Programs** tab
2. Tap any workout program
3. Select a workout from the program
4. Tap "Start Workout"
5. All exercises from the template will be loaded

**Option 2: Start Empty Workout**
1. Tap the **floating action button** (+ icon) on the Home screen
2. Or go to Programs → "Quick Start" → "Empty Workout"
3. Add exercises manually as you go

### 🏋️ During a Workout

**Adding Exercises**:
1. Tap "Add Exercise" button
2. Search or browse the exercise library
3. Tap an exercise to add it to your workout
4. Exercise will appear with 3 default sets

**Logging Sets**:
1. Tap on the **Weight** field and enter weight (lbs)
2. Tap on the **Reps** field and enter reps
3. Complete the set in real life
4. Tap the **checkmark** button to mark set as complete
5. Rest timer will automatically start

**Using the Rest Timer**:
- Timer starts automatically when you complete a set
- Default rest time: 90 seconds
- Tap the timer to adjust rest duration
- Skip rest timer by tapping "Skip" or starting next set

**Managing Exercises**:
- **Reorder**: Long-press and drag exercises to reorder
- **Add Sets**: Tap "+ Add Set" below any exercise
- **Remove Exercise**: Swipe left on exercise header
- **Add Notes**: Tap the notes icon to add exercise notes

**Completing Your Workout**:
1. Tap "Finish Workout" button at the bottom
2. Review your workout summary
3. Confirm to save
4. All data is saved to your workout history
5. Analytics and stats are automatically updated

### 📊 Analytics Screen

Track your progress over time:
- **Total Workouts**: All completed workout sessions
- **Day Streak**: Consecutive days with at least one workout
- **Total Sets**: All completed sets across all workouts
- **Progress Summary**: Detailed breakdown of your stats
- **Motivational Messages**: Dynamic encouragement based on your progress

**Refreshing Analytics**:
- Pull down to refresh and see latest stats
- Data updates automatically when you return to the tab

### 🗂️ Programs Tab

Manage your workout programs:

**Creating a Program**:
1. Tap "Create Program" button
2. Enter program name (e.g., "Push Pull Legs", "5x5 Strength")
3. Add description (optional)
4. Tap "Create"

**Adding Workouts to Programs**:
1. Open any program
2. Tap "Add Workout"
3. Enter workout name (e.g., "Push Day A", "Leg Day")
4. Add exercises to the workout template
5. Set default sets for each exercise
6. Save workout

**Starting a Program Workout**:
1. Open a program
2. Tap any workout in the program
3. Tap "Start Workout"
4. All template exercises load automatically
5. Log your sets as you work out

### 🔍 Exercise Library

Browse and search exercises:
- **Search**: Type exercise name in search bar
- **Filter by Muscle Group**: Tap category buttons (Chest, Back, Legs, etc.)
- **View Details**: Tap any exercise to see description and demo
- **Add to Workout**: Tap "Add to Workout" (only during active workout)

**Custom Exercises** (Pro):
- Tap "Create Exercise" in library
- Enter exercise name and details
- Select primary muscle group
- Add description or notes
- Save to your personal library

### ⚙️ Profile & Settings

**Profile Tab Features**:
- View subscription status
- Manage account preferences
- Export workout data
- Access debug tools (for testing)

**Data Export**:
1. Go to Profile → "Data & Privacy"
2. Tap "Export Data"
3. Choose format (CSV or PDF)
4. Data includes all workouts, exercises, and stats

**Debug Tools** (Development):
1. Go to Profile → "Debug Analytics"
2. Create sample workouts for testing
3. Check database contents
4. View real-time logs

### 🎯 Tips for Best Results

**Stay Consistent**:
- Log every workout to track progress
- Use the streak feature for motivation
- Review analytics weekly

**Smart Progression**:
- Gradually increase weights over time
- Track personal records
- Review previous workout data before starting

**Program Structure**:
- Create programs for different goals (strength, hypertrophy, conditioning)
- Include rest days in your weekly schedule
- Mix compound and isolation exercises

**Rest Periods**:
- Heavy compound lifts: 3-5 minutes
- Hypertrophy work: 60-90 seconds
- Isolation exercises: 45-60 seconds

**Data Privacy**:
- All data stored locally on your device
- No internet required for core features
- Export data anytime

---

## Project Structure

```
workoutbuilder-pro/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigator screens
│   │   ├── index.tsx      # Home/Dashboard
│   │   ├── programs.tsx   # Programs list
│   │   ├── analytics.tsx  # Analytics & charts
│   │   └── profile.tsx    # Profile & settings
│   ├── _layout.tsx        # Root layout
│   ├── onboarding.tsx     # Onboarding flow
│   └── paywall.tsx        # Subscription paywall
├── src/
│   ├── components/        # Reusable components
│   ├── screens/           # Screen-specific components
│   ├── services/          # Business logic
│   │   ├── database.ts    # SQLite service
│   │   └── purchases.ts   # RevenueCat service
│   ├── types/             # TypeScript types
│   └── ui/                # Design system
│       ├── theme.ts       # Colors, gradients, typography
│       ├── Button.tsx     # Button component
│       ├── Card.tsx       # Card component
│       └── StatCard.tsx   # Stat card component
├── assets/                # Images, icons, fonts
├── research/              # Market research
├── aso/                   # App Store Optimization
└── package.json
```

---

## Configuration

### RevenueCat Setup

1. Create account at [revenuecat.com](https://www.revenuecat.com)
2. Add your app to RevenueCat dashboard
3. Configure products:
   - **Monthly**: $6.99/month
   - **Annual**: $49.99/year
4. Update API keys in `src/services/purchases.ts`:
   ```typescript
   const REVENUECAT_API_KEY = {
     ios: 'YOUR_IOS_API_KEY',
     android: 'YOUR_ANDROID_API_KEY',
   };
   ```

### Firebase Analytics (Optional)

1. Create Firebase project
2. Add iOS and Android apps
3. Download config files:
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)
4. Place in project root (Expo will auto-configure)

---

## Subscription Tiers

### Free Tier
- 3 custom workout programs
- 100+ exercise library
- Workout logging with rest timer
- 30-day history
- Basic progress charts

### Pro Tier ($6.99/month or $49.99/year)
- Unlimited workout programs
- Full 500+ exercise library
- Unlimited workout history
- Advanced analytics & trends
- Strength standards comparison
- Program templates
- Custom exercises with photos
- Data export (CSV, PDF)
- Premium gradient themes

---

## Database Schema

### Key Tables
- **exercises**: Exercise library (default + custom)
- **programs**: Workout programs
- **program_workouts**: Workouts within programs
- **program_exercises**: Exercises within workout templates
- **workouts**: Completed workout sessions
- **workout_exercises**: Exercises in completed workouts
- **workout_sets**: Individual sets logged
- **personal_records**: PR tracking

---

## Building for Production

### iOS

```bash
# Create production build
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

### Android

```bash
# Create production build
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

---

## App Store Assets

### Required Images
- App Icon: 1024×1024 PNG
- Screenshots: 6.7" iPhone (1290×2796)
- iPad screenshots (if supporting tablets)

### ASO Files (in `/aso/`)
- `app_title.txt`: App Store title
- `subtitle.txt`: App Store subtitle
- `description.md`: Full App Store description
- `keywords.txt`: ASO keywords

---

## Privacy & Data

### Data Storage
All user data stored locally using SQLite:
- Workout history
- Programs and exercises
- Personal records
- User preferences

### No Cloud Sync
- Data never leaves device
- No account required
- Export available via Settings

### Privacy Compliance
- No personal data collection
- Anonymous usage analytics (opt-out available)
- GDPR/CCPA compliant
- Privacy Policy included in app

---

## Monetization

### Subscription Model
- **Freemium**: Generous free tier to demonstrate value
- **Soft Paywall**: Triggered after 3 programs or 30 days history
- **7-Day Trial**: Free trial for all premium features
- **Platform**: RevenueCat handles cross-platform subscriptions

### Expected Conversion
- Target: 10-12% free-to-paid conversion
- Industry average: 5-8%
- Higher conversion due to:
  - Clear value demonstration in free tier
  - Premium UI justifies subscription
  - Fair pricing ($50/year)

---

## Performance

### Optimization
- SQLite queries optimized with indexes
- Virtualized lists for exercise library
- Image assets optimized and lazy-loaded
- Smooth 60fps animations throughout

### Offline Support
- Full functionality offline
- Subscription status cached locally
- Analytics queued when offline, sent when online

---

## Testing

### Manual Testing Checklist
- [ ] Onboarding flow completes
- [ ] Workout logging works offline
- [ ] Rest timer functions correctly
- [ ] Subscription purchase/restore works
- [ ] Data export generates valid files
- [ ] PR detection triggers animation
- [ ] Charts render with real data
- [ ] Haptic feedback on all actions

### Subscription Testing
Use RevenueCat sandbox mode:
1. Create test user in RevenueCat dashboard
2. Use sandbox API keys during development
3. Test purchase, restore, and expiration flows

---

## Support & Contact

- **Email**: support@workoutbuilder.app
- **Website**: https://workoutbuilder.app
- **Privacy**: https://workoutbuilder.app/privacy
- **Terms**: https://workoutbuilder.app/terms

---

## License

Copyright © 2026 WorkoutBuilder Pro. All rights reserved.

---

## Changelog

### v1.0.0 (January 2026)
- Initial release
- Core workout tracking functionality
- Premium visual design with gradients
- RevenueCat subscription integration
- Offline-first SQLite database
- Analytics dashboard
- Program builder
- 500+ exercise library

---

**Built with ❤️ for lifters who take training seriously.**

