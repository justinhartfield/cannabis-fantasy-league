# Profile Page & Avatar Integration - Implementation Plan

## Project Context

**Goal:** Create a Profile page with user details editing and avatar upload functionality, link it from the username in the main navigation, and integrate avatars to display next to team names on Challenge and Draft pages.

**Tech Stack:**
- Frontend: React 19 + TypeScript, Wouter (routing), tRPC, Tailwind CSS, Radix UI
- Backend: Express + tRPC, Drizzle ORM
- Database: PostgreSQL
- Storage: Built-in storage proxy (already configured)

**Current State:**
- Users table exists with basic fields (id, openId, name, email, loginMethod, role, etc.)
- Navigation component displays username but is not clickable
- Team names displayed throughout Challenge and Draft pages
- Storage system configured and ready for file uploads

---

## Implementation Phases

### Phase 1: Database Schema Update
**Objective:** Add avatar field to users table

**Tasks:**
1. Create Drizzle migration to add `avatarUrl` field to users table
   - Field type: `varchar(500)` (nullable)
   - Stores the URL of the uploaded avatar image
2. Update TypeScript schema in `drizzle/schema.ts`
3. Run migration to update database

**Files to modify:**
- `drizzle/schema.ts` - Add avatarUrl field to users table definition
- Create new migration file in `drizzle/` directory

---

### Phase 2: Backend API - Profile Management
**Objective:** Create tRPC endpoints for profile operations

**Tasks:**
1. Create `server/profileRouter.ts` with endpoints:
   - `getProfile` - Get current user's profile data
   - `updateProfile` - Update user name/email
   - `uploadAvatar` - Handle avatar file upload using storage.ts
   - `deleteAvatar` - Remove avatar and clear avatarUrl

2. Integrate with existing storage system (`server/storage.ts`)
   - Use existing upload/download URL functions
   - Store avatars in `/avatars/{userId}/` path

3. Add profileRouter to main router in `server/routers.ts`

**Files to create:**
- `server/profileRouter.ts`

**Files to modify:**
- `server/routers.ts` - Add profileRouter

---

### Phase 3: Profile Page Frontend
**Objective:** Build the Profile page UI with form and avatar upload

**Tasks:**
1. Create `client/src/pages/Profile.tsx`:
   - Display current user information
   - Form for editing name and email
   - Avatar upload component with preview
   - Delete avatar button
   - Save/Cancel buttons

2. Use existing UI components:
   - Radix UI Avatar component (already installed)
   - Form components from `components/ui/`
   - Button, Input, Label components

3. Implement avatar upload logic:
   - File input with image preview
   - Client-side validation (file size, type)
   - Upload progress indicator
   - Error handling

4. Add route to `client/src/App.tsx`:
   - Route path: `/profile`

**Files to create:**
- `client/src/pages/Profile.tsx`

**Files to modify:**
- `client/src/App.tsx` - Add Profile route

---

### Phase 4: Navigation Update
**Objective:** Make username clickable and link to Profile page

**Tasks:**
1. Update `client/src/components/Navigation.tsx`:
   - Wrap username display in Link component
   - Link to `/profile` route
   - Add hover effect to indicate clickability
   - Keep UserCircle icon

**Files to modify:**
- `client/src/components/Navigation.tsx`

---

### Phase 5: Avatar Integration - Data Layer
**Objective:** Ensure avatar data is available where team names are displayed

**Tasks:**
1. Update team queries to include user avatar:
   - Modify `server/leagueRouter.ts` - Include user avatar in team data
   - Update team type definitions to include avatarUrl

2. Ensure avatar data flows through:
   - League detail queries
   - Challenge participant queries
   - Draft status queries
   - Matchup queries

**Files to modify:**
- `server/leagueRouter.ts`
- `shared/types.ts` (if exists) or relevant type definition files

---

### Phase 6: Avatar Integration - Challenge Page
**Objective:** Display avatars next to team names on Challenge page

**Tasks:**
1. Update `client/src/pages/DailyChallenge.tsx`:
   - Add Avatar component next to team names in leaderboard
   - Add Avatar component in team score blocks
   - Add Avatar component in winner display
   - Handle missing avatars with fallback (initials or default icon)

2. Create reusable component if needed:
   - `client/src/components/TeamAvatar.tsx`
   - Props: avatarUrl, teamName, size
   - Fallback to initials from team name

**Files to modify:**
- `client/src/pages/DailyChallenge.tsx`

**Files to create (optional):**
- `client/src/components/TeamAvatar.tsx`

---

### Phase 7: Avatar Integration - Draft Page
**Objective:** Display avatars next to team names on Draft page

**Tasks:**
1. Update `client/src/pages/Draft.tsx`:
   - Add Avatar component in draft board team displays
   - Add Avatar component in recent picks list
   - Add Avatar component in roster display

2. Update `client/src/components/DraftBoard.tsx`:
   - Add Avatar component next to team names in draft order
   - Add Avatar component in pick history

3. Update `client/src/components/MyRoster.tsx`:
   - Add Avatar component in roster header

**Files to modify:**
- `client/src/pages/Draft.tsx`
- `client/src/components/DraftBoard.tsx`
- `client/src/components/MyRoster.tsx`

---

### Phase 8: Testing & Deployment
**Objective:** Test all functionality and deploy to preview server

**Tasks:**
1. Local testing:
   - Test profile page CRUD operations
   - Test avatar upload/delete
   - Test avatar display on Challenge page
   - Test avatar display on Draft page
   - Test navigation link
   - Test with/without avatars (fallback behavior)

2. Deploy to preview server:
   - Build application
   - Deploy to Render or Railway
   - Test on live environment

3. Create test report documenting:
   - Features implemented
   - Test results
   - Known issues (if any)
   - Screenshots

**Deliverables:**
- Test report document
- Live preview URL

---

## Technical Specifications

### Avatar Upload Specifications
- **Allowed formats:** JPEG, PNG, GIF, WebP
- **Max file size:** 5MB
- **Recommended dimensions:** 200x200px (will be resized/cropped)
- **Storage path:** `/avatars/{userId}/{timestamp}-{filename}`

### Avatar Display Specifications
- **Sizes:**
  - Navigation: 32x32px
  - Challenge page: 40x40px
  - Draft page: 36x36px
- **Fallback:** Display initials from team name or username in colored circle
- **Border:** Subtle border for visual separation

### API Endpoints (tRPC)
```typescript
profile.getProfile() -> { id, name, email, avatarUrl }
profile.updateProfile({ name?, email? }) -> { success: boolean }
profile.uploadAvatar({ file: File }) -> { avatarUrl: string }
profile.deleteAvatar() -> { success: boolean }
```

---

## Dependencies & Constraints

**Existing Dependencies (Already Installed):**
- `@radix-ui/react-avatar` - Avatar component
- `@aws-sdk/client-s3` - S3 client (if needed for storage)
- `zod` - Schema validation
- `react-hook-form` - Form handling

**No New Dependencies Required**

**Constraints:**
- Must use existing storage system in `server/storage.ts`
- Must follow existing authentication pattern
- Must maintain existing UI/UX patterns
- Must work with existing tRPC setup

---

## Success Criteria

1. ✅ Users can navigate to Profile page by clicking username in navigation
2. ✅ Users can edit their name and email on Profile page
3. ✅ Users can upload an avatar image
4. ✅ Users can delete their avatar
5. ✅ Avatars display next to team names on Challenge page
6. ✅ Avatars display next to team names on Draft page
7. ✅ Fallback display works when no avatar is set
8. ✅ All changes persist across page refreshes
9. ✅ Application deployed to preview server
10. ✅ No breaking changes to existing functionality

---

## Risk Mitigation

**Risk:** Storage system issues
- **Mitigation:** Test storage upload/download before full implementation

**Risk:** Performance impact of loading multiple avatars
- **Mitigation:** Use appropriate image sizes, lazy loading if needed

**Risk:** Breaking existing team display logic
- **Mitigation:** Incremental changes, test each page separately

**Risk:** Database migration issues
- **Mitigation:** Test migration on development database first, create rollback plan

---

## Next Steps

1. Review and confirm this plan
2. Begin Phase 1: Database Schema Update
3. Deploy to preview server after each phase for continuous validation
