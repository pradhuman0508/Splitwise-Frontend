# Current User Functionality in Groups

This document explains how the current user functionality is implemented in the Splitwise Frontend application.

## Overview

The application now includes functionality to identify and handle the currently logged-in user within group contexts. This allows for personalized experiences such as showing individual balances, preventing self-removal from groups, and displaying user-specific information.

## Implementation Details

### 1. GroupMember Interface Enhancement

The `GroupMember` interface has been enhanced with an optional `isCurrentUser` flag:

```typescript
export interface GroupMember {
  id: number;
  name: string;
  email: string;
  avatar: string;
  balance: number;
  owesTo: { name: string; amount: number }[];
  owedBy: { name: string; amount: number }[];
  isCurrentUser?: boolean; // New flag to identify current user
}
```

### 2. GroupsService Methods

The `GroupsService` now includes several methods to handle current user functionality:

#### Core Methods:
- `getCurrentUser()`: Returns the current authenticated user from Firebase Auth
- `isCurrentUser(memberEmail: string)`: Checks if a member email matches the current user
- `getCurrentUserMemberData(groupId: number)`: Gets the current user's member data for a specific group
- `isCurrentUserInGroup(groupId: number)`: Checks if current user is a member of a group

#### Data Management:
- `updateCurrentUserInGroups()`: Updates current user identification in all groups
- `addCurrentUserToGroup(groupId: number, user: User)`: Adds current user to a group if not present
- `refreshCurrentUserData()`: Refreshes current user data when user logs in/out

### 3. Component Updates

#### GroupMemberComponent:
- Displays current user with a "You" badge
- Prevents removal of current user from group
- Highlights current user row with blue background
- Disables remove button for current user

#### GroupDetailComponent:
- Shows current user's personal balance instead of group balance
- Displays current user status in member avatars
- Updates menu items based on current user membership

#### GroupListComponent:
- Shows current user's balance for each group
- Includes sorting by user balance
- Displays personalized balance information

### 4. Authentication Integration

The system integrates with Firebase Authentication:

```typescript
// Get current user from Firebase Auth
getCurrentUser(): User | null {
  const auth = getAuth();
  return auth.currentUser;
}

// Check if member is current user
isCurrentUser(memberEmail: string): boolean {
  const currentUser = this.getCurrentUser();
  return currentUser?.email === memberEmail;
}
```

## Usage Examples

### 1. Displaying Current User in Group Members

```typescript
// In component
this.groupsService.getGroupMembers(groupId).subscribe(members => {
  this.members = members;
  this.currentUserMember = members.find(member => member.isCurrentUser) || null;
});
```

### 2. Showing Current User's Balance

```typescript
// Get current user's balance for a group
this.groupsService.getCurrentUserMemberData(groupId).subscribe(member => {
  if (member) {
    console.log(`Your balance: ${member.balance}`);
  }
});
```

### 3. Preventing Current User Actions

```typescript
// Check if member can be removed
canRemoveMember(member: GroupMember): boolean {
  return !member.isCurrentUser;
}
```

## UI Features

### Visual Indicators:
- Current user is marked with a "You" badge
- Current user row has blue background highlighting
- Current user avatar shows "(You)" in tooltip
- Remove button is disabled for current user

### Balance Display:
- Shows "Your Balance" instead of "Group Balance"
- Displays personalized balance information
- Color-coded balance (green for owed, red for owe, gray for settled)

### Menu Options:
- Menu items are filtered based on current user membership
- Different options shown for group members vs non-members

## Testing

To test the current user functionality:

1. **Login with a user account** that matches one of the member emails in the group data
2. **Navigate to groups** to see personalized balance information
3. **View group details** to see current user highlighting
4. **Try to remove yourself** from a group (should be prevented)

## Future Enhancements

1. **Group Ownership**: Add owner role with additional permissions
2. **Invitation System**: Allow current users to invite others to groups
3. **Permission Levels**: Different permissions for different member types
4. **Real-time Updates**: Update current user data when authentication state changes

## Notes

- The current implementation uses Firebase Authentication
- Current user identification is based on email matching
- The system automatically adds current user to groups if not present
- All current user data is refreshed when authentication state changes 