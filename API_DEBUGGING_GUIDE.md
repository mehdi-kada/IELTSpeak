# API Debugging Guide: How We Fixed the Rating API Issues

## Overview

This guide explains the problems we encountered while setting up the IELTS/TOEFL evaluation API and how we fixed them step by step. This is written for beginners to understand both the problems and solutions clearly.

---

## Problems We Encountered

### 1. **404 Not Found Error**

**Error Message:** `POST http://localhost:3000/api/ratings/78d4e0d5... [HTTP/1.1 404 Not Found]`

### 2. **JSON Parsing Error**

**Error Message:** `SyntaxError: JSON.parse: unexpected character at line 1 column 1`

### 3. **Session ID Undefined**

**Error Message:** `Session ID: undefined`

### 4. **Gemini Response Format Issues**

**Error Message:** `Unexpected token '`', "```json is not valid JSON`

---

## Problem 1: Wrong API URL (404 Error)

### What Was Wrong

In our React component (`page.tsx`), we were calling:

```typescript
const res = await fetch(`/api/ratings/${sessionId}`, { // ❌ Wrong - "ratings" (plural)
```

But our API route file was located at:

```
app/api/rating/[sessionID]/route.ts  // ✅ Correct - "rating" (singular)
```

### Why This Happened

- **File-based routing**: In Next.js, the URL is determined by the folder structure
- **Mismatch**: `/api/ratings/` doesn't exist, only `/api/rating/` exists
- **Result**: Server couldn't find the endpoint, returned 404

### How We Fixed It

Changed the URL in the frontend to match the actual API route:

```typescript
const res = await fetch(`/api/rating/${sessionId}`, { // ✅ Fixed - "rating" (singular)
```

### Key Lesson

**Always make sure your API calls match your file structure exactly!**

---

## Problem 2: Session ID Coming as Undefined

### What Was Wrong

The API was receiving `Session ID: undefined` even though we were sending it correctly.

### Root Cause Analysis

In Next.js dynamic routes, the parameter name must **exactly match** the folder name:

**Our folder structure:**

```
app/api/rating/[sessionID]/route.ts  // Folder name: "sessionID" (capital ID)
```

**Our code was:**

```typescript
{ params }: { params: Promise<{ sessionId: string }> }  // ❌ Wrong - "sessionId" (lowercase id)
//                                    ^^^^^^^^^
//                                    This didn't match!
```

### How We Fixed It

Changed the parameter type to match the folder name exactly:

```typescript
{ params }: { params: Promise<{ sessionID: string }> }  // ✅ Fixed - "sessionID" (capital ID)
const resolvedParams = await params;
const sessionId = resolvedParams.sessionID; // Access with correct property name
```

### Key Lesson

**In Next.js dynamic routes, parameter names are case-sensitive and must match folder names exactly!**

---

## Problem 3: JSON Parsing Error from Gemini

### What Was Wrong

Gemini AI was returning the JSON response wrapped in markdown code blocks:

````
```json
{
  "ielts_ratings": {
    "fluency": 6.0,
    ...
  }
}
````

````

When we tried to parse this with `JSON.parse()`, it failed because:
- `JSON.parse()` expects pure JSON
- Our response had markdown formatting (```json and ```)

### How We Fixed It
Added a cleaning step before parsing the JSON:

```typescript
// Get response from Gemini
const evaluation = response.text();
console.log('Raw Gemini response:', evaluation);

// Clean the response by removing markdown code blocks
let cleanedEvaluation = evaluation.trim();
if (cleanedEvaluation.includes('```json')) {
  cleanedEvaluation = cleanedEvaluation.replace(/```json\s*/, '').replace(/\s*```$/, '');
} else if (cleanedEvaluation.includes('```')) {
  cleanedEvaluation = cleanedEvaluation.replace(/```\s*/, '').replace(/\s*```$/, '');
}

console.log('Cleaned response:', cleanedEvaluation);

// Now parse the cleaned JSON
let parsedEvaluation = JSON.parse(cleanedEvaluation);
````

### What This Code Does

1. **Get raw response** from Gemini
2. **Remove markdown formatting**:
   - Remove ````json` from the beginning
   - Remove ```` from the end
   - Handle both `json` and plain ``` cases
3. **Parse the clean JSON**

### Key Lesson

**Always validate and clean API responses before parsing them as JSON!**

---

## Problem 4: Incorrect API Response Format

### What Was Wrong

Our API was returning malformed responses:

```typescript
return NextResponse.json(evaluation, parsedEvaluation); // ❌ Wrong syntax
```

### How We Fixed It

Created a proper, structured response:

```typescript
// Prepare final result
const finalResult = {
  sessionId,
  messageCount: messages.length,
  level,
  evaluation: parsedEvaluation,
  processedAt: new Date().toISOString(),
};

return NextResponse.json(finalResult); // ✅ Correct - single object
```

### Key Lesson

**`NextResponse.json()` takes one object, not multiple parameters!**

---

## Problem 5: Poor Error Handling

### What Was Wrong

Our error handling was basic and didn't provide useful information for debugging.

### How We Fixed It

Added comprehensive error handling:

```typescript
// In the frontend (React component)
try {
  console.log("Sending messages to rating API:", messages);

  const res = await fetch(`/api/rating/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, level }),
  });

  if (!res.ok) {
    const errorText = await res.text(); // Get error details
    console.error("API Error Response:", errorText);
    throw new Error(`API responded with status ${res.status}: ${errorText}`);
  }

  const result = await res.json();
  console.log("Rating API response:", result);

  return result;
} catch (error) {
  console.error("Error sending messages to rating api:", error);
  throw error;
}
```

```typescript
// In the API route
try {
  // ... API logic
} catch (error) {
  console.error("Error processing with model:", error);
  return NextResponse.json(
    {
      error: "failed to process with model",
      details: error instanceof Error ? error.message : "unknown error",
    },
    { status: 500 }
  );
}
```

### Key Lesson

**Always log detailed error information to help with debugging!**

---

## Step-by-Step Debugging Process

### 1. **Check the Network Tab**

- Open browser Developer Tools (F12)
- Go to Network tab
- Look for your API calls
- Check if they're returning 404, 500, or other errors

### 2. **Check Console Logs**

- Look at both browser console and VS Code terminal
- Add `console.log()` statements to track data flow
- Log inputs, outputs, and errors

### 3. **Verify File Structure**

- Make sure API routes match folder structure
- Check spelling and capitalization
- Ensure parameter names match folder names

### 4. **Test API Independently**

- Use tools like Thunder Client or Postman
- Test with known good data
- Isolate frontend vs backend issues

### 5. **Validate Data Types**

- Check what you're sending vs what API expects
- Ensure JSON is properly formatted
- Verify all required fields are present

---

## Final Working Code Summary

### Frontend API Call:

```typescript
const sendCoversationToAPI = async () => {
  setIsSavingResults(true);
  try {
    const res = await fetch(`/api/rating/${sessionId}`, {
      // ✅ Correct URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, level }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API responded with status ${res.status}: ${errorText}`);
    }

    const result = await res.json();
    localStorage.setItem(`evaluation_${sessionId}`, JSON.stringify(result));
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    setIsSavingResults(false);
  }
};
```

### Backend API Route:

````typescript
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionID: string }> } // ✅ Correct parameter name
) {
  try {
    const resolvedParams = await params;
    const sessionId = resolvedParams.sessionID; // ✅ Correct access
    const { messages, level } = await req.json();

    // ... Gemini processing ...

    // ✅ Clean the response
    let cleanedEvaluation = evaluation.trim();
    if (cleanedEvaluation.includes("```json")) {
      cleanedEvaluation = cleanedEvaluation
        .replace(/```json\s*/, "")
        .replace(/\s*```$/, "");
    }

    const parsedEvaluation = JSON.parse(cleanedEvaluation);

    // ✅ Proper response format
    const finalResult = {
      sessionId,
      messageCount: messages.length,
      level,
      evaluation: parsedEvaluation,
      processedAt: new Date().toISOString(),
    };

    return NextResponse.json(finalResult);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "failed to process", details: error.message },
      { status: 500 }
    );
  }
}
````

---

## Testing Checklist

After making these fixes, test:

- [ ] API URL resolves correctly (no 404)
- [ ] Session ID is captured properly
- [ ] Messages are sent correctly
- [ ] Gemini response is parsed successfully
- [ ] Final response has correct structure
- [ ] Error handling works for edge cases
- [ ] Results are stored for the results page

---

## Key Takeaways for Beginners

1. **File Structure Matters**: In Next.js, URLs match folder structure exactly
2. **Case Sensitivity**: Parameter names must match folder names precisely
3. **Always Clean External Data**: APIs might return data in unexpected formats
4. **Error Handling is Crucial**: Good error messages save hours of debugging
5. **Log Everything**: Use console.log liberally during development
6. **Test Incrementally**: Fix one issue at a time, test, then move to the next

Remember: **Debugging is a skill that improves with practice. Every error teaches you something new!**
