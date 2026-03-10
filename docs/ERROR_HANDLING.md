# Server Action Error Handling Guide

This project uses a standardized error handling architecture for Server Actions (`use server`). This ensures that no matter what fails on the backend, the frontend always receives a predictable JSON object containing the error message and an HTTP status code equivalent.

## 📁 Source File

`frontend/src/lib/utils/actionError.ts`

## 🧱 The Standardized Response

All Server Actions wrapped in our error handler will return an object matching the `ActionResponse` type:

```typescript
export type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
};
```

---

## 🛠️ Usage (Backend / Server Actions)

You do not need massive `try/catch` blocks inside your actions anymore.

**Rule 1:** Wrap your exported server action function in `withActionErrorHandler`.
**Rule 2:** Defensively check conditions and `throw` an error class when they fail.

### Step 1: Wrap your Action

```typescript
import { withActionErrorHandler } from "@/lib/utils/actionError";

export const doSomethingAwesome = withActionErrorHandler(async (formData) => {
  // 1. Business Logic here

  // 2. Return data directly. The wrapper attaches { success: true }
  return { id: 123, message: "Created!" };
});
```

### Step 2: Throwing Errors

We have built-in classes to throw specific error codes. You do not need to return `{ error: "..." }` manually.

#### ⛔ 401 Unauthorized (Not logged in)

Use when the user does not have a valid session.

```typescript
import { UnauthorizedError } from "@/lib/utils/actionError";

const user = await checkSession();
if (!user) {
  throw new UnauthorizedError();
  // Returns: { success: false, code: 401, error: "Unauthorized. Please log in." }
}
```

#### 🚫 403 Forbidden (Missing permissions)

Use when the user is logged in, but their role (e.g., Guest vs Admin) prevents them from performing the action.

```typescript
import { ForbiddenError } from "@/lib/utils/actionError";

if (user.role !== "admin") {
  throw new ForbiddenError("You must be an admin to delete an event.");
  // Returns: { success: false, code: 403, error: "You must be an admin..." }
}
```

#### ⚠️ Custom Errors (400, 429, 404, etc.)

Use the base `ActionError` class for specific business logic failures (Bad input, Rate Limiting, Not Found).

```typescript
import { ActionError } from "@/lib/utils/actionError";

// 400 Bad Request
if (!title) {
  throw new ActionError("Title is required", 400);
}

// 404 Not Found
if (!eventExists) {
  throw new ActionError("Event does not exist", 404);
}

// 429 Too Many Requests
if (rateLimitExceeded) {
  throw new ActionError("Spam detected. Please slow down.", 429);
}
```

#### 💥 Unknown Crashes (500)

If a generic Javascript error (`throw new Error("Whoops")`) or a raw database connection error occurs, the `withActionErrorHandler` will automatically intercept it, hide the internal system crash trace from the client, and return:
`{ success: false, code: 500, error: "An unexpected server error occurred." }`

---

## 💻 Usage (Frontend / Components)

Because all actions now return the same structure, your React frontend code becomes very simple and clean.

```tsx
"use client";
import { doSomethingAwesome } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Or whatever toast library you use

export default function MyButton() {
  const router = useRouter();

  const handleClick = async () => {
    const result = await doSomethingAwesome("Some Data");

    if (!result.success) {
      // Log exactly what went wrong
      console.error(`Error ${result.code}: ${result.error}`);

      // Standard User Feedback
      toast.error(result.error);

      // Example: Force redirect if they lost their session
      if (result.code === 401) {
        router.push("/login");
      }
      return;
    }

    // Happy Path! Look at result.data!
    toast.success("Done!");
    console.log("Returned Server Data:", result.data);
  };

  return <button onClick={handleClick}>Run Action</button>;
}
```
