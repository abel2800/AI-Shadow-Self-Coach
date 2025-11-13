# Environment Variables Setup Guide

The `.env` file has been created. You need to update the following values:

---

## 🔴 Required (Must Update)

### 1. Database Password
```env
DB_PASSWORD=your_actual_postgres_password
```
**Action:** Replace `your_password_here` with your PostgreSQL password

### 2. OpenAI API Key
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key
```
**Action:** 
- Get your API key from: https://platform.openai.com/api-keys
- Replace `your_openai_api_key_here` with your actual key

---

## 🟡 Optional (Can Update Later)

### JWT Secret
```env
JWT_SECRET=shadow_coach_jwt_secret_key_change_in_production_2024
```
**Note:** The default is fine for development, but change it for production.

### Vector DB (Pinecone)
```env
PINECONE_API_KEY=your_pinecone_api_key_here
```
**Note:** Optional for MVP - can be added later for session memory features.

### Encryption Key
```env
ENCRYPTION_KEY=your_32_character_encryption_key_here
```
**Note:** Generate a 32-character random string for production.

---

## ✅ Already Set (No Changes Needed)

These values are fine for development:
- `NODE_ENV=development`
- `PORT=3000`
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=shadow_coach`
- `DB_USER=postgres`
- `CRISIS_HOTLINE_US=988`
- `CRISIS_TEXT_LINE=741741`

---

## Quick Setup Steps

1. **Edit `.env` file:**
   ```bash
   # Open in your editor
   code backend/.env
   # Or use any text editor
   ```

2. **Update Database Password:**
   - Find: `DB_PASSWORD=your_password_here`
   - Replace with your PostgreSQL password

3. **Add OpenAI API Key:**
   - Get key from: https://platform.openai.com/api-keys
   - Find: `OPENAI_API_KEY=your_openai_api_key_here`
   - Replace with your actual key

4. **Save the file**

---

## Testing Without OpenAI (Optional)

If you want to test the API structure without OpenAI first, you can:
1. Leave `OPENAI_API_KEY` as is
2. The conversation service will fail, but other endpoints will work
3. You can test auth, sessions, journal, analytics endpoints

---

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to git (it's in `.gitignore`)
- Use different values for production
- Keep your OpenAI API key secret
- Generate strong passwords for production

---

**After updating `.env`, you're ready to start the server!** 🚀

