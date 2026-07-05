# MongoDB Atlas Configuration

This project is configured to use MongoDB Atlas cloud database.

## Current Setup

✅ **Database:** MongoDB Atlas (Cloud)  
✅ **Cluster:** EmployeeFeedback  
✅ **Connection:** Configured in `backend/.env`  
✅ **Data Persistence:** Verified and working  

## Connection Details

- **Database Name:** `employee-feedback`
- **Connection String:** Configured in `backend/.env` (not committed to Git)
- **Default Users Seeded:**
  - Employee: `employee@example.com` / `Password123!`
  - Manager: `manager@example.com` / `Password123!`

## For New Developers

To set up your own MongoDB Atlas:

1. Create a free account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new M0 (free) cluster
3. Set up database user with username and password
4. Whitelist your IP address in Network Access
5. Get the connection string from "Connect" → "Drivers"
6. Update `backend/.env` with your connection string:
   ```
   MONGODB_URI=mongodb://username:password@cluster.mongodb.net/employee-feedback?...
   ```

## Environment Variable

The MongoDB connection is configured via the `MONGODB_URI` environment variable in `backend/.env`:

```env
MONGODB_URI=mongodb://username:password@cluster.mongodb.net/employee-feedback?ssl=true&replicaSet=...
```

**Important:** Never commit your `.env` file with actual credentials to Git!

## Fallback Mode

If MongoDB Atlas is not accessible, the application automatically falls back to an in-memory database for development (data is lost on restart).

## Verification

To verify MongoDB connection:
1. Start the backend server: `npm start`
2. Check logs for: `✅ MongoDB connected: [cluster-name]`
3. Check health endpoint: `http://localhost:5000/api/health`

---

**Setup completed:** July 5, 2026  
**Database Type:** MongoDB Atlas (Cloud)  
**Status:** ✅ Active and verified
