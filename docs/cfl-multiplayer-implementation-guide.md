# Cannabis Fantasy League: Multiplayer Implementation Guide

**Author:** Manus AI  
**Date:** November 10, 2025

## 1. Introduction

This document outlines the easiest and most effective approach to implement full multiplayer functionality in the Cannabis Fantasy League application. The current architecture is already well-suited for multiplayer support, and this guide will detail the necessary steps to enable a seamless multiplayer experience.

## 2. Core Architecture

The application is built on a solid foundation that already supports the core concepts of multiplayer functionality:

- **User Authentication:** The `authRouter.ts` provides a mock authentication system that can be easily extended to a full-fledged OAuth or email/password system.
- **Database Schema:** The database schema (`drizzle/schema.ts`) is designed with multiplayer in mind, with clear relationships between `users`, `leagues`, and `teams`.
- **tRPC Backend:** The tRPC API provides a strongly-typed and efficient communication layer between the frontend and backend.

## 3. Key Implementation Steps

### 3.1. Real-time Draft with WebSockets

The most critical component for a real-time multiplayer experience is the draft. The current draft logic is based on HTTP polling, which is not ideal for a live draft. The easiest way to implement a real-time draft is to use **WebSockets**.

**Implementation Steps:**

1.  **Add a WebSocket Server:** Integrate a WebSocket library like `ws` or `Socket.IO` into the existing Node.js server.
2.  **Create a Draft Room:** When a draft starts, create a dedicated WebSocket room for that league.
3.  **Broadcast Draft Events:** When a player makes a pick, broadcast the following events to all clients in the draft room:
    - `player_picked`: Sent when a player is drafted, including the player's details and the team that drafted them.
    - `next_pick`: Sent to notify all clients whose turn it is to pick.
    - `draft_status_update`: Sent to update the draft clock, current pick, and other status information.
4.  **Update Frontend:** The `DraftBoard.tsx` component should be updated to connect to the WebSocket server and listen for these events. When an event is received, the component should update its state accordingly, providing a real-time view of the draft.

### 3.2. Live Scoring Updates

Similar to the draft, live scoring updates can be implemented using WebSockets. When the scoring engine calculates the weekly scores, it should broadcast an event to all connected clients.

**Implementation Steps:**

1.  **Create a Scoring Channel:** Create a WebSocket channel for each league to broadcast scoring updates.
2.  **Broadcast Score Updates:** When the `calculateWeeklyScores` function in `scoringRouter.ts` is executed, it should broadcast a `scores_updated` event to the league's channel, including the updated scores for all teams.
3.  **Update Frontend:** The `ScoringBreakdown.tsx` and other relevant components should listen for this event and update their state to reflect the new scores.

### 3.3. User Invitations and League Management

The current system allows users to join a league with an invite code. This can be enhanced with a more user-friendly invitation system.

**Implementation Steps:**

1.  **Email Invitations:** Integrate an email service (e.g., SendGrid, Nodemailer) to allow commissioners to invite users to their league via email.
2.  **In-App Notifications:** Implement an in-app notification system to alert users when they have been invited to a league.
3.  **League Management UI:** Enhance the league management UI to allow commissioners to manage league members, settings, and the draft.

## 4. Easiest Path to Implementation

To implement multiplayer functionality as easily as possible, the following approach is recommended:

1.  **Focus on the Draft First:** The live draft is the most critical multiplayer feature. Prioritize the implementation of the WebSocket-based real-time draft.
2.  **Leverage Existing Components:** The existing React components are well-structured and can be easily adapted to handle real-time data from WebSockets.
3.  **Use a Simple WebSocket Library:** A lightweight WebSocket library like `ws` is sufficient for this application and will be easier to integrate than a more complex solution like Socket.IO.
4.  **Iterate and Enhance:** Start with the core multiplayer features (draft and scoring) and then iterate to add more advanced features like live chat, trades, and waiver wire claims.

## 5. Conclusion

The Cannabis Fantasy League application is well-positioned for a straightforward multiplayer implementation. By leveraging the existing architecture and focusing on a WebSocket-based approach for real-time updates, a compelling and engaging multiplayer experience can be delivered with minimal complexity.
