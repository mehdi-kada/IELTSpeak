# Understanding the NEXT_REDIRECT Error: A Complete Guide

## What is the NEXT_REDIRECT Error?

The `NEXT_REDIRECT` error is **not actually an error** - it's a special mechanism used by Next.js to handle redirects in server actions. However, when it's not handled properly, it appears as an uncaught error in your application.

## Why Does This Error Occur?

### 1. **Server Actions vs Client Components**

Next.js has two types of components:

- **Server Components**: Run on the server during build time or request time
- **Client Components**: Run in the browser (marked with `"use client"`)

### 2. **How `redirect()` Works**

When you call `redirect()` in a server action, Next.js doesn't return a normal response. Instead, it **throws a special error** with the type `NEXT_REDIRECT` that contains the redirect information.

```typescript
// This is what happens internally when you call redirect()
throw new Error("NEXT_REDIRECT", {
  type: "redirect",
  destination: "/new-path",
});
```

### 3. **The Problem in Your Code**

Your original code had this pattern:

```typescript
// ❌ PROBLEMATIC: Server Action with redirect()
export const insertSession = async ({ level }: sessionProps) => {
  // ... database operations
  redirect(`/levels/${newSession.id}?level=${level}`); // This throws NEXT_REDIRECT
};

// ❌ PROBLEMATIC: Client Component calling server action
const handleSubmit = async () => {
  await insertSession({ level }); // This receives the NEXT_REDIRECT "error"
};
```

## Understanding the Root Cause

### Server Actions Execution Flow

1. **Server Action Called**: When you call `insertSession()` from a client component
2. **Database Operation**: The function runs on the server, creates the session
3. **Redirect Thrown**: `redirect()` throws the `NEXT_REDIRECT` "error"
4. **Error Propagation**: This "error" gets sent back to the client component
5. **Uncaught Promise**: Your client code doesn't handle this special "error"
6. **Browser Console**: Shows "Uncaught (in promise) Error: NEXT_REDIRECT"

### Why This Happens

- **Server actions with `redirect()`** are designed to work with **form submissions** or **server-side navigation**
- **Client event handlers** (like `onClick`) don't automatically handle the redirect mechanism
- The `NEXT_REDIRECT` gets treated as a regular error instead of a redirect instruction

## How to Fix This Error

There are several approaches to fix this issue:

### Solution 1: Return Data Instead of Redirecting (Recommended)

**Before (Problematic):**

```typescript
// ❌ Server Action
export const insertSession = async ({ level }: sessionProps) => {
  // ... database operations
  redirect(`/levels/${newSession.id}?level=${level}`);
};

// ❌ Client Component
const handleSubmit = async () => {
  await insertSession({ level }); // Throws NEXT_REDIRECT
};
```

**After (Fixed):**

```typescript
// ✅ Server Action - Return data instead of redirecting
export const insertSession = async ({ level }: sessionProps) => {
  // ... database operations
  return {
    sessionId: newSession.id,
    redirectUrl: `/levels/${newSession.id}?level=${level}`,
  };
};

// ✅ Client Component - Handle navigation manually
import { useRouter } from "next/navigation";

const handleSubmit = async () => {
  const router = useRouter();
  const result = await insertSession({ level });
  if (result?.redirectUrl) {
    router.push(result.redirectUrl); // Client-side navigation
  }
};
```

### Solution 2: Use Form Actions (Alternative)

Instead of button `onClick`, use form submission:

```typescript
// ✅ Server Action (can use redirect)
export const insertSession = async (formData: FormData) => {
  const level = formData.get("level") as string;
  // ... database operations
  redirect(`/levels/${newSession.id}?level=${level}`); // Works with forms
};

// ✅ Client Component with form
<form action={insertSession}>
  <input type="hidden" name="level" value={level} />
  <button type="submit">Start Session</button>
</form>;
```

### Solution 3: Catch and Handle the Redirect (Not Recommended)

```typescript
// ⚠️ Works but not ideal
const handleSubmit = async () => {
  try {
    await insertSession({ level });
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      // Extract redirect URL and navigate manually
      // This is fragile and depends on internal Next.js behavior
    }
  }
};
```

## Best Practices

### 1. **When to Use Each Approach**

| Scenario                 | Recommended Solution              |
| ------------------------ | --------------------------------- |
| Button click events      | Return data + `useRouter`         |
| Form submissions         | Server action with `redirect()`   |
| Complex navigation logic | Return data + client-side routing |
| Simple form redirects    | Form action with `redirect()`     |

### 2. **Server Action Guidelines**

```typescript
// ✅ Good: Return data for client-side navigation
export const createItem = async (data: ItemData) => {
  const item = await database.create(data);
  return { id: item.id, url: `/items/${item.id}` };
};

// ✅ Good: Use redirect() with form actions
export const createItemAction = async (formData: FormData) => {
  const item = await database.create(extractData(formData));
  redirect(`/items/${item.id}`);
};

// ❌ Avoid: redirect() in server actions called from event handlers
export const badCreateItem = async (data: ItemData) => {
  const item = await database.create(data);
  redirect(`/items/${item.id}`); // Will cause NEXT_REDIRECT error
};
```

### 3. **Client Component Guidelines**

```typescript
"use client";
import { useRouter } from "next/navigation";

// ✅ Good: Handle navigation explicitly
const MyComponent = () => {
  const router = useRouter();

  const handleAction = async () => {
    const result = await serverAction();
    if (result.redirectUrl) {
      router.push(result.redirectUrl);
    }
  };

  return <button onClick={handleAction}>Action</button>;
};

// ✅ Good: Use form for automatic redirect handling
const MyFormComponent = () => {
  return (
    <form action={serverActionWithRedirect}>
      <button type="submit">Submit</button>
    </form>
  );
};
```

## Advanced Understanding

### How Next.js Handles Redirects Internally

1. **Server Actions with Forms**: Next.js automatically catches `NEXT_REDIRECT` and performs the redirect
2. **Server Actions with Fetch**: The redirect "error" is serialized and sent to the client
3. **Client Handling**: Client components must manually handle redirect responses

### Error Types in Next.js

```typescript
// Next.js internal redirect mechanism
class NextRedirectError extends Error {
  constructor(url: string, type: "push" | "replace" = "push") {
    super("NEXT_REDIRECT");
    this.digest = `NEXT_REDIRECT;${type};${url}`;
  }
}
```

### Debugging Tips

1. **Check Network Tab**: Look for server action requests and their responses
2. **Console Logs**: Add logging before and after server action calls
3. **Error Boundaries**: Use React error boundaries to catch unhandled redirects

```typescript
// Debugging server actions
export const debugServerAction = async (data: any) => {
  console.log("Server action started", data);

  try {
    const result = await performOperation(data);
    console.log("Operation successful", result);

    // Option 1: Return data
    return { success: true, redirectUrl: "/success" };

    // Option 2: Redirect (only if called from form)
    // redirect('/success');
  } catch (error) {
    console.error("Server action failed", error);
    throw error;
  }
};
```

## Common Pitfalls to Avoid

### 1. **Mixing Patterns**

```typescript
// ❌ Don't mix redirect() with event handlers
const handleClick = async () => {
  await serverActionWithRedirect(); // Will throw NEXT_REDIRECT
};

// ✅ Be consistent with your approach
const handleClick = async () => {
  const result = await serverActionWithData();
  router.push(result.url);
};
```

### 2. **Ignoring Error Handling**

```typescript
// ❌ No error handling
const handleSubmit = async () => {
  await serverAction();
};

// ✅ Proper error handling
const handleSubmit = async () => {
  try {
    const result = await serverAction();
    if (result.redirectUrl) {
      router.push(result.redirectUrl);
    }
  } catch (error) {
    console.error("Action failed:", error);
    // Handle actual errors (not redirects)
  }
};
```

### 3. **Not Understanding the Context**

- **Forms**: Automatically handle redirects
- **Event Handlers**: Require manual navigation
- **useEffect**: Be careful with server actions in effects

## Summary

The `NEXT_REDIRECT` error occurs when:

1. A server action uses `redirect()`
2. The server action is called from a client component event handler
3. The client doesn't properly handle the redirect response

**The fix is simple**: Either return navigation data from server actions and use `useRouter`, or use form actions that handle redirects automatically.

**Key Takeaway**: `NEXT_REDIRECT` isn't really an error - it's Next.js's way of communicating redirect instructions. The "error" happens when this communication isn't handled properly in your client code.
