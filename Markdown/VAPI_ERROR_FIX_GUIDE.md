# Vapi AI Error Fix Guide

## Common Errors and Solutions

### 1. CORS Error (400 Bad Request)

**Error**: `Response { data: null, error: {...}, type: "cors", url: "https://api.vapi.ai/call/web", status: 400 }`

**Causes**:

- Missing or invalid API key
- Incorrect assistant configuration
- CORS policy issues
- Invalid voice ID or transcriber settings

**Solutions**:

#### A. Check API Key

1. Create `.env.local` file in your project root
2. Add your Vapi API key:
   ```
   NEXT_PUBLIC_VAPI_API_KEY=your_actual_vapi_api_key
   ```
3. Get your API key from [Vapi Dashboard](https://dashboard.vapi.ai)

#### B. Verify Assistant Configuration

- Use valid voice IDs from your Vapi account
- Ensure transcriber provider is supported
- Check model provider settings

#### C. Fixed Configuration

The assistant configuration has been updated to use:

- **Transcriber**: Deepgram (nova-2 model)
- **Voice**: ElevenLabs with valid voice ID
- **Model**: OpenAI GPT-4

### 2. Environment Variables

**Required Variables**:

```env
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key
```

**Optional Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_key
```

### 3. Next.js Configuration

The `next.config.ts` has been updated to handle CORS properly:

```typescript
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, PUT, DELETE, OPTIONS",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "Content-Type, Authorization",
        },
      ],
    },
  ];
}
```

### 4. Troubleshooting Steps

1. **Restart Development Server**:

   ```bash
   npm run dev
   ```

2. **Check Browser Console**:

   - Look for API key validation errors
   - Check network tab for failed requests

3. **Verify API Key**:

   - Test your API key in Vapi Dashboard
   - Ensure it has proper permissions

4. **Test Assistant Configuration**:
   - Try with minimal configuration first
   - Add features incrementally

### 5. Additional Notes

- Vapi API keys must be valid and active
- Some voice IDs may require premium accounts
- Transcriber providers have different capabilities
- Check Vapi documentation for latest API changes

### 6. Support

If issues persist:

1. Check [Vapi Documentation](https://docs.vapi.ai)
2. Verify your account status
3. Contact Vapi support with specific error details
