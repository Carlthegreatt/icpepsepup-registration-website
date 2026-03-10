# Layered Architecture Guide

This project follows a strict **Layered Architecture** designed to separate concerns, improve testability, and maintain clean code as the application grows.

## Core Layers overview

1. **Application Layer (Server Actions)** -> `src/actions/`
2. **Validator Layer (Zod)** -> `src/validators/`
3. **Domain & Business Logic Layer (Services)** -> `src/services/`
4. **Data Access Layer (Repositories)** -> `src/repositories/`

---

### 1. Application Layer (`src/actions/`)
**Purpose**: Acts as the entry point from the UI to the backend. Next.js Server Actions live here.
**Rules**:
- UI components should *only* call functions from this layer. 
- Actions should NEVER contain raw database queries.
- Actions MUST validate input data using the **Validator Layer** before passing it down.
- Handle unexpected errors gracefully and return structured responses (e.g., `{ success: true, data: ... }` or `{ success: false, error: ... }`).

### 2. Validator Layer (`src/validators/`)
**Purpose**: Defines the shape of the data entering the application and enforces validation. We use `zod` for this.
**Rules**:
- All schemas should be exported and used in the Server Actions layer.
- Keep validation logic strict to prevent malformed data from reaching the Business logic layer.

### 3. Domain & Business Layer (`src/services/`)
**Purpose**: Contains the core business logic, orchestrations, and rules of the application.
**Rules**:
- Services process data and make decisions. 
- Services orchestrate multiple calls to different Repositories if needed.
- **NEVER** expose HTTP Requests, Next.js abstractions (`redirect()`, `revalidatePath()`), or raw UI logic here.
- Services should throw standard Errors when invariants are violated, which are caught and handled by Server Actions.

### 4. Data Access Layer (`src/repositories/`)
**Purpose**: Handles all interactions with the database (Supabase). 
**Rules**:
- This is the ONLY layer that should import Supabase clients (`@supabase/ssr`, `@supabase/supabase-js`, etc.) and run queries (`.from(...)`, `.select(...)`, `.insert(...)`).
- Do not put business logic here. Repositories just fetch or persist data as instructed by the Services.

---

**In a nutshell, yung Life Cycle ng Request ay:**
- **Actions** - Taga-salo ng request galing sa UI at taga-balik ng response. Wala dapat direct database query dito.
- **Validators** - Checking checker ng data (Zod). Sila nagme-make sure na tama yung format ng ipinasang data.
- **Services** - Ang main logic ng app. Dito ginagawa yung mga rules at validation ng business logic for example if may permissiono ba yung user na mag delete ng event.
- **Repositories** - Ang kaisa-isang layer na-nagcoconnect sa Database (Supabase). Taga-kuha at taga-save ng data. parang supabaseDBClient na ginagamit natin.

## Example: Login/Registration Flow Through the Layers

To see the architecture in action, let's trace what happens when a user attempts to log in.

### 1. User Clicks "Login" (UI)
The `UserLoginForm` component collects the email and password, then calls the Server Action. It does not hit an API route directly.
```tsx
import { loginAction } from "@/actions/authActions";

// Inside the component...
const onSubmit = async () => {
  const result = await loginAction({ email, password });
  if (result.success) {
    // success!
  }
}
```

### 2. Action Validates Input (`src/actions/authActions.ts`)
The `loginAction` first validates the input against `LoginSchema` (from `src/validators/authValidators.ts`). Only if validation passes, it calls the `loginUser` service.
```ts
import { LoginSchema } from "@/validators/authValidators";
import { loginUser } from "@/services/authService";

export async function loginAction(data: any) {
  try {
    const validatedData = LoginSchema.parse(data);
    const result = await loginUser(validatedData.email, validatedData.password);
    return { success: true };
  } catch (error) {
    return { success: false, error: "..." };
  }
}
```

### 3. Service Handles Business Logic (`src/services/authService.ts`)
The `loginUser` service handles the core operation (in this case, authenticating via Supabase). If authentication is successful, it might fetch extra user details (like the role) to return or throw an error if it fails.
```ts
import { getUserRole } from "@/repositories/authRepository";
import { createClient } from "@/lib/supabase/server";

export async function loginUser(email, password) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) throw new Error(error.message);
  
  // Optionally call repositories to get extra data
  const role = await getUserRole(data.user.id);
  
  return { user: data.user, role };
}
```

### 4. Repository Accesses Database (`src/repositories/authRepository.ts`)
If the service needs specific database interactions (like `getUserRole`), it calls the repository. 
```ts
import { createAdminClient } from "@/lib/supabase/admin";

export async function getUserRole(userId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase.from("users").select("role").eq("id", userId).single();
  return data?.role;
}
```

---

## Instructions: Creating New Logic

When implementing a new feature (e.g., "Add Comment to Event"):

1. **Validators**: Define the payload schema in `src/validators/commentValidators.ts` using `zod`.
2. **Repository**: Create a function `insertComment(eventId, userId, text)` in `src/repositories/commentRepository.ts` that directly runs the Supabase `.insert()` query.
3. **Service**: Create `addCommentService(payload, userId)` in `src/services/commentService.ts`. Add any business rules here (e.g., checking if the user is allowed to comment) and then call the Repository function.
4. **Action**: Create `addCommentAction(data)` in `src/actions/commentActions.ts`. Validate the incoming `data` with the Zod schema, pass it to the Service, catch potential errors, revalidate the necessary Next.js paths, and return a status payload.
5. **UI**: Inside your Component, call `const res = await addCommentAction(formData)`.

---

## Authentication & Global User Store (`useUserStore`)

We use **Zustand** to manage the global user state on the client side without relying on complex, slow context providers. 

**Path:** `src/store/useUserStore.ts`

### Why use `useUserStore`?
Instead of fetching the user from Supabase on every protected component mount, you can use the client-side store to get instant access to the user's `role`, `userId`, and `loading` state.

```tsx
import { useUserStore } from "@/store/useUserStore";

export function MyComponent() {
  const { role, userId, loading } = useUserStore();

  if (loading) return <Spinner />;
  if (role !== "admin") return <Unauthorized />;

  return <div>Welcome Admin {userId}</div>;
}
```

### Validating Requests in the Service Layer
While the UI uses `useUserStore` to gate visual access, **you must securely validate backend requests in the Service Layer or Actions layer**.

- Never trust the client-side role for backend operations.
- You can pass the `userId` from the frontend (or let the Action fetch the current session via `getUserRoleAction()`) to determine permissions on the server.
- The Service layer should enforce rules like: `if (event.organizerId !== userId) throw new Error("Unauthorized")`.

---

## Logging (`src/utils/logger.ts`)

For better observability and debugging, always use the custom `logger` utility rather than standard `console.log()` statements, particularly in the Server Actions and Services layers. **Do not hesitate to add more logs—the more context we have on operations, errors, and system state, the easier it is to debug issues in production.**

NOTE: Sa terminal nakikita yung logs (kung saan ka nag npm run dev) hindi sa browser console :))

```ts
import { logger } from "@/utils/logger";

// Info level for successful operations or important milestones
logger.info("Successfully created new event", { eventId: 123 });

// Warn level for potential issues or unauthorized access attempts
logger.warn("Unauthorized access attempt to event settings", { userId: "abc" });

// Error level for caught exceptions
try {
  // ...
} catch (error) {
  logger.error("Failed to update event details", error);
}
```

The logger formats outputs clearly and can be easily extended in the future (e.g., to send logs to an external monitoring service like Datadog or Sentry).
