# Member Registration Check & Invite Functionality

This document explains the new functionality that checks if members are registered in Firebase before adding them to groups, and sends invitations to non-registered users.

## Overview

When adding members to groups, the system now:
1. Checks if the user is registered in Firebase Authentication
2. If registered: Adds them directly to the group
3. If not registered: Sends an invitation to join the platform and group

## Components Updated

### 1. UserManagementService (`src/app/core/user-management.service.ts`)

**Key Methods:**
- `checkUserExists(email: string)`: Checks if a user exists in Firebase Auth
- `sendInvitation(email, groupId?, groupName?)`: Sends invitation to non-registered users
- `processMemberAddition(memberData, groupId?, groupName?)`: Main method that handles the logic
- `processMembersBatch(members, groupId?, groupName?)`: Batch processing for multiple members

**Features:**
- Uses Firebase's `fetchSignInMethodsForEmail` to check user registration
- Simulates invitation sending (can be connected to real backend API)
- Handles both individual and batch member processing
- Returns detailed status information for each member

### 2. CreateGroupComponent (`src/app/pages/groups/create-group/`)

**New Features:**
- **Check Status Button**: Users can check if a member is registered before submitting
- **Real-time Status Display**: Shows registration status for each member
- **Toast Notifications**: Provides feedback on member processing
- **Enhanced Form Validation**: Ensures proper member data before processing

**UI Enhancements:**
- Search icon button to check member status
- Status indicators with color-coded icons
- Member status summary section
- Loading states during processing

### 3. GroupMemberComponent (`src/app/pages/groups/group-member/`)

**New Features:**
- **Name Field**: Added member name input alongside email
- **Status Checking**: Check if user is registered before adding
- **Enhanced Dialog**: Better UI with status display
- **Real-time Feedback**: Toast messages for all actions

## How It Works

### 1. Member Addition Flow

```
User enters member details
         ↓
Check if user exists in Firebase
         ↓
    ┌─────────────┐
    │   Exists?   │
    └─────────────┘
         ↓
    ┌─────────────┐
    │     Yes     │  →  Add directly to group
    └─────────────┘
         ↓
    ┌─────────────┐
    │      No     │  →  Send invitation
    └─────────────┘
```

### 2. Firebase Integration

The system uses Firebase Authentication's `fetchSignInMethodsForEmail` method to check if a user exists:

```typescript
async checkUserExists(email: string): Promise<boolean> {
  try {
    const auth = getAuth();
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    return signInMethods.length > 0;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}
```

### 3. Invitation System

When a user is not registered, the system creates an invitation object:

```typescript
const invite: UserInvite = {
  email,
  groupId,
  groupName,
  invitedBy: currentUser.email || '',
  invitedAt: new Date(),
  status: 'pending'
};
```

## Usage Examples

### 1. Creating a Group with Members

1. Open "Create New Group" dialog
2. Fill in group details
3. Add member information (name and email)
4. Click the search icon to check member status
5. Submit the form
6. System processes each member:
   - Registered users: Added directly
   - Non-registered users: Receive invitations

### 2. Adding Members to Existing Group

1. Navigate to group details
2. Click "Add Member"
3. Enter member name and email
4. Optionally check user status
5. Click "Add Member"
6. System handles registration check and invitation

## Status Indicators

### Visual Status Codes:
- 🟢 **Green Check**: User is registered
- 🔵 **Blue Info**: User not registered, invitation will be sent
- 🔴 **Red Warning**: Error checking user status

### Toast Messages:
- **Success**: "User is already registered"
- **Info**: "User will receive an invitation to join"
- **Error**: "Error checking user status"

## Configuration

### Firebase Setup
Ensure Firebase Authentication is properly configured in `app.config.ts`:

```typescript
provideFirebaseApp(() => 
    initializeApp({
        "projectId":"your-project-id",
        "appId":"your-app-id",
        // ... other config
    })),
provideAuth(() => getAuth())
```

### Backend Integration
To connect to a real backend API, update the `sendInvitation` method in `UserManagementService`:

```typescript
sendInvitation(email: string, groupId?: number, groupName?: string): Observable<any> {
  // Replace the mock implementation with real API call
  return this.http.post(`${this.apiUrl}/invitations`, {
    email,
    groupId,
    groupName,
    invitedBy: getAuth().currentUser?.email
  });
}
```

## Error Handling

The system handles various error scenarios:
- Network errors during Firebase checks
- Invalid email formats
- Missing member information
- API failures during invitation sending

All errors are displayed to users via toast notifications and status indicators.

## Future Enhancements

1. **Email Templates**: Customizable invitation email templates
2. **Invitation Management**: Track and manage pending invitations
3. **Bulk Operations**: Process multiple members simultaneously
4. **Real-time Updates**: WebSocket integration for live status updates
5. **Analytics**: Track invitation acceptance rates

## Testing

To test the functionality:

1. **Registered User Test**:
   - Use an email that exists in your Firebase Auth
   - Should show green check and add directly

2. **Non-registered User Test**:
   - Use a non-existent email
   - Should show blue info and send invitation

3. **Error Test**:
   - Disconnect internet or use invalid Firebase config
   - Should show red warning

## Notes

- The current implementation uses mock invitation sending
- Firebase Auth checks are real and functional
- All UI feedback is implemented with PrimeNG components
- The system is designed to be easily extensible for backend integration
