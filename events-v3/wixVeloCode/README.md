# Wix Velo Event Guest API 🤝

This folder contains **backend HTTP functions** for Wix Velo, designed to securely retrieve event guest data and contact information. These functions are intended to be called by external services, particularly **n8n workflows**, for seamless integration with your Wix Events and CRM data.

Technical Details ⚙️
This project consists of JavaScript files living in the **Wix Velo backend environment**. They expose HTTP endpoints that interact with Wix's native APIs (`wix-events.v2`,` wix-crm.v2`) and the **Wix Secrets Manager** for secure JWT verification.

## 📍 File Location

These files are located within the `backend/` directory of your Wix Velo project:

- `backend/http-functions.js`: Defines the public HTTP endpoints.
- `backend/eventGuestService.web.js`: Contains the core logic for querying event guests and contact details, and handling JWT authentication.
- `backend/util.web.js`: Provides utility functions, specifically for validating the Authorization header.

## 🚀 How Does it Work?

This Wix Velo backend code exposes two primary HTTP POST endpoints for fetching event guest-related data. Both endpoints require JWT-based authorization for secure access.

1. **JWT Authorization & Validation** 🔐:

- Requests to these endpoints must include an `Authorization` header in the format Bearer YOUR_JWT_TOKEN.
- The `validateAuthorizationHeader` utility extracts this token.
- The `decodeJwtToken` function then verifies the JWT's signature and expiration against a secret key retrieved from the Wix Secrets Manager. This ensures only authorized requests with valid, unexpired tokens can access your data.
- The JWT secret keys (`JWT_EVENT_GUEST` and `JWT_EVENT_GUEST_PHONE`) are placeholders that must be replaced with your actual secret tokens for the Wix Secrets Manager.

2. `post_findEventGuests` **Endpoint** 👥

- **Endpoint**: `https://www.yourdomain.com/_functions/findEventGuests`
- **Purpose**: Retrieves a list of event guests for a specified eventId.
- **Filtering**: It supports an optional `lastCheckedTimestamp` (ISO 8601 format) to fetch only guests whose attendance status was updated after the given timestamp, enabling efficient delta synchronization.
- **Wix API**: Internally uses `wix-events.v2.guests.queryGuests` with `elevate` to bypass permission restrictions and access all necessary guest details.
- **Returns**: An array of guest objects or an empty array if no new guests are found, along with a descriptive message.

3. `post_findEventGuestPhone` **Endpoint** 📞

- Endpoint: `https://www.yourdomain.com/_functions/findEventGuestPhone`
- **Purpose**: Fetches the primary phone number for a given `userId` (Wix CRM Contact ID).
- **Wix API**: Internally uses `wix-crm.v2.contacts.getContact` with `elevate` to retrieve the contact's details.
- **Returns**: An object containing the phone number if found, or an empty string, along with a message.

4. `post_updateContactPhone` **Endpoint** 📞

- Endpoint: `https://www.yourdomain.com/_functions/updateContactPhone`
- **Purpose**: Updates the primary phone number for a given `userId` (Wix CRM Contact ID).
- **Wix API**: Internally uses `wix-crm.v2.contacts.updateContact` with `elevate` to update the contact's details.
- **Returns**: An object containing the updated contact's email, along with a message.

This architecture allows your n8n workflows (or any authorized external system) to securely query and integrate with your Wix Events and CRM data without directly exposing your Wix backend or requiring manual authentication.

## 🧠 Explanations

### 💡 JWT-Based Authorization in Wix Velo 🔒

Using **JSON Web Tokens (JWTs)** for authorization in Wix Velo HTTP functions offers a robust and secure way to control access to your backend services.

- **How it works**:
  When an external service (like n8n) needs to call a protected Wix function, it first generates a JWT using a pre-shared secret. This token is then included in the `Authorization: Bearer <token>` header of the HTTP request.

- **Why it’s secure**:

  - **No API Keys in URLs**: Unlike traditional API keys, JWTs are sent via headers—not query parameters—reducing the risk of accidental exposure.

  - **Token Expiration**: JWTs include an expiration (`exp`) claim. This app uses a 15-minute TTL, limiting the time window during which a stolen token can be used.

- **Signature Verification**: JWTs are signed using a shared secret. On receiving a token, the Wix backend verifies its signature using the same secret—fetched securely from the **Wix Secrets Manager**. If the signature is invalid or the token has been tampered with, the request is rejected.

- **Secure Secret Handling with Wix Secrets Manager**:  
  Secrets should never be hardcoded. Wix Secrets Manager enables secure, runtime access to sensitive values like the JWT signing key, keeping them out of your source code and version control.

This setup ensures that only trusted applications—those holding the correct secret—can generate valid, time-limited tokens to access your Wix backend endpoints.

### ⬆️ The `elevate` Function in Wix Velo

The `elevate()` function (e.g., `elevate(guests.queryGuests)`) is a powerful Wix Velo feature used to temporarily grant higher permissions to backend code.

- **What it does**:
  By default, Wix backend code respects role-based permissions. The `elevate()` function allows a backend call to run with elevated (admin-level) privileges, enabling access to restricted data and operations.

- **Why it’s used here**:

  - **Accessing Full Data**: Certain operations—like retrieving all event guests or detailed contact info (e.g., phone numbers)—require higher privileges than those granted to regular site visitors or members.

  - **Backend-Only Execution**: Functions wrapped in `elevate()` can only be called from the backend, not the client. This enforces a strict separation between frontend and privileged operations.

- **Security Implications**:
  While powerful, `elevate()` should be used with care. Any function using it bypasses standard access controls. That’s why functions protected by `elevate()` must be guarded by strong authentication—such as the JWT authorization described above.

## 🔗 Wix Velo API References

For more detailed information on the Wix Velo APIs used:

- HTTP Functions: [Expose an API with HTTP Functions](https://dev.wix.com/docs/velo/articles/getting-started/expose-an-api)
- Wix Secrets Manager: [About the Secrets Manager](https://dev.wix.com/docs/develop-websites/articles/workspace-tools/developer-tools/secrets-manager/about-the-secrets-manager)
- Wix Events V2 - Guests: [queryGuests](https://dev.wix.com/docs/velo/apis/wix-events-v2/guests/query-guests)
- Wix CRM V2 - Contacts: [getContact](https://dev.wix.com/docs/velo/apis/wix-crm-v2/contacts/contacts/get-contact)
- Wix CRM V2 - Contacts: [updateContact](https://dev.wix.com/docs/velo/apis/wix-crm-v2/contacts/contacts/update-contact)
- Wix Authentication: [elevate](https://dev.wix.com/docs/velo/apis/wix-auth/elevate)
