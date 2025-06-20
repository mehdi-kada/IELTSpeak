# Supabase JSONB Database Insertion Guide

## Overview

This guide explains how to insert IELTS/TOEFL evaluation data into Supabase using JSONB columns. We're storing the evaluation results in three separate JSONB columns: `ielts_rating`, `toefl_rating`, and `feedback`.

## Database Schema

### Sessions Table Structure

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ielts_rating JSONB,
  toefl_rating JSONB,
  feedback JSONB,
  messages_count INTEGER,
  level TEXT,
  processed_at TIMESTAMP,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### JSONB Column Formats

#### 1. `ielts_rating` Column:

```json
{
  "fluency": 7.5,
  "grammar": 6.5,
  "vocabulary": 7.0,
  "pronunciation": 6.5,
  "overall": 6.9
}
```

#### 2. `toefl_rating` Column:

```json
{
  "delivery": 3,
  "language_use": 3,
  "topic_development": 4,
  "overall": 100
}
```

#### 3. `feedback` Column:

```json
{
  "positives": [
    "Demonstrated good vocabulary range",
    "Clear pronunciation throughout",
    "Maintained natural speech flow",
    "Effective use of examples"
  ],
  "negatives": [
    "Occasional grammatical errors",
    "Could improve sentence variety",
    "Some hesitation in responses",
    "Limited use of complex structures"
  ]
}
```

## Environment Variables Setup

### 1. Add to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Why Service Role Key?

- **Client Key**: Limited permissions, RLS (Row Level Security) applies
- **Service Role Key**: Full access, bypasses RLS, use for server-side operations
- **Security**: Never expose service role key to client-side code

## Database Operations Explained

### 1. Update Existing Session

```typescript
const { data, error } = await supabase
  .from("sessions")
  .update({
    ielts_rating: parsedEvaluation.ielts_ratings, // JSONB data
    toefl_rating: parsedEvaluation.toefl_ratings, // JSONB data
    feedback: parsedEvaluation.feedback, // JSONB data
    messages_count: messages.length, // INTEGER
    level, // TEXT
    processed_at: new Date().toISOString(), // TIMESTAMP
    status: "completed", // TEXT
  })
  .eq("id", sessionId); // WHERE condition
```

### 2. Insert New Session (Fallback)

```typescript
const { data, error } = await supabase.from("sessions").insert([
  {
    id: sessionId, // UUID
    ielts_rating: parsedEvaluation.ielts_ratings, // JSONB
    toefl_rating: parsedEvaluation.toefl_ratings, // JSONB
    feedback: parsedEvaluation.feedback, // JSONB
    messages_count: messages.length, // INTEGER
    level, // TEXT
    processed_at: new Date().toISOString(), // TIMESTAMP
    status: "completed", // TEXT
  },
]);
```

## Complete API Implementation

### How the Current Code Works:

1. **Parse Gemini Response**: Convert AI response to JavaScript object
2. **Try Update First**: Attempt to update existing session record
3. **Fallback to Insert**: If update fails, create new record
4. **Handle Errors**: Proper error handling and logging
5. **Return Results**: Send success response to client

### Key Features:

#### Error Handling:

- Validates required data before database operations
- Logs detailed error messages for debugging
- Returns appropriate HTTP status codes
- Graceful fallback from update to insert

#### Data Validation:

- Checks if evaluation data is properly parsed
- Validates session ID exists
- Ensures required fields are present

#### Logging:

- Comprehensive console logs for debugging
- Database operation status tracking
- Error details for troubleshooting

## Testing Database Operations

### 1. Check Supabase Dashboard

- Go to your Supabase project dashboard
- Navigate to Table Editor
- Select `sessions` table
- Verify new records appear after API calls

### 2. Query Database Directly

```sql
-- Check recent sessions
SELECT * FROM sessions
ORDER BY processed_at DESC
LIMIT 5;

-- Check specific session
SELECT * FROM sessions
WHERE id = 'your-session-id';

-- Query JSONB data
SELECT
  id,
  ielts_rating->>'overall' as ielts_score,
  toefl_rating->>'overall' as toefl_score,
  feedback->'positives' as strengths
FROM sessions
WHERE processed_at > NOW() - INTERVAL '1 day';
```

### 3. Test API Response

```bash
# Using curl or Thunder Client
POST /api/rating/test-session-123
{
  "messages": [...],
  "level": "B1"
}
```

## Common Issues and Solutions

### Issue 1: RLS (Row Level Security) Errors

**Error**: "Row Level Security policy violation"

**Solution**:

- Use service role key for server-side operations
- Or disable RLS for testing: `ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;`

### Issue 2: JSONB Format Errors

**Error**: "Invalid JSON format"

**Solution**:

- Ensure Gemini returns valid JSON
- Use JSON.parse() to validate before insertion
- Clean markdown formatting from AI responses

### Issue 3: UUID Format Errors

**Error**: "Invalid UUID format"

**Solution**:

- Ensure sessionId is valid UUID format
- Generate UUID: `crypto.randomUUID()` or use Supabase auto-generation

### Issue 4: Column Not Found

**Error**: "Column 'ielts_rating' does not exist"

**Solution**:

- Check table schema in Supabase dashboard
- Ensure column names match exactly
- Run migration to add missing columns

## Best Practices

### 1. Data Consistency

- Always validate data before insertion
- Use transactions for multiple related operations
- Handle partial failures gracefully

### 2. Security

- Never expose service role key to client
- Use environment variables for sensitive data
- Implement proper error handling

### 3. Performance

- Use selective updates (only changed fields)
- Consider indexing frequently queried JSONB fields
- Batch operations when possible

### 4. Monitoring

- Log all database operations
- Monitor for failed insertions
- Set up alerts for database errors

## Next Steps

1. **Test the Implementation**: Run the API with real conversation data
2. **Verify Database**: Check Supabase dashboard for new records
3. **Add Validation**: Implement additional data validation if needed
4. **Monitor Performance**: Track API response times and database performance
5. **Add Indexes**: Create indexes on frequently queried JSONB fields if needed

## Example Complete Flow

1. **User completes speaking test** → Messages collected
2. **API called** → `/api/rating/session-123`
3. **Gemini processes** → Returns evaluation JSON
4. **Database updated** → JSONB data stored in respective columns
5. **Response sent** → Client receives confirmation
6. **Results page** → Displays stored evaluation data

This approach gives you clean, structured data storage with the flexibility of JSONB for complex evaluation objects while maintaining good performance and queryability.
