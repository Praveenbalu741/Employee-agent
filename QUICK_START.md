# 🚀 Quick Start Guide

## Option 1: Double-Click to Start (Easiest!)

**Just double-click:** `START_HERE.bat`

This opens a control panel where you can:
- ✅ Start the application
- ✅ Stop the application
- ✅ Restart if needed
- ✅ Open website
- ✅ View logs

---

## Option 2: Individual Scripts

### Start Everything:
Double-click: `start-all.bat`

### Stop Everything:
Double-click: `stop-all.bat`

### Restart Everything:
Double-click: `restart-all.bat`

---

## 🌐 Access the Website

Once started, open your browser:
```
http://localhost:5173
```

---

## 🔑 Login Credentials

**Employee Account:**
- Email: `employee@example.com`
- Password: `Password123!`

**Manager Account:**
- Email: `manager@example.com`  
- Password: `Password123!`

---

## 🛠️ Troubleshooting

### If servers don't start:
1. Run `stop-all.bat` first
2. Wait 5 seconds
3. Run `start-all.bat` again

### If website shows errors:
1. Check that both terminal windows are open (Backend + Frontend)
2. Wait 10-15 seconds after starting for servers to initialize
3. Refresh your browser

### If MongoDB connection fails:
- The app automatically uses in-memory database
- Your data will work fine, just resets on restart
- To fix permanently, update IP whitelist in MongoDB Atlas

---

## 📁 File Structure

```
START_HERE.bat          ← Main control panel (USE THIS!)
start-all.bat           ← Start both servers
stop-all.bat            ← Stop both servers  
restart-all.bat         ← Restart both servers
logs/                   ← Application logs
```

---

## 🎯 Common Issues Fixed

✅ **Servers crash** → Auto-restart enabled  
✅ **MongoDB fails** → Automatic fallback to in-memory DB  
✅ **Port conflicts** → Scripts check and clear ports  
✅ **Memory issues** → Proper cleanup on stop  

---

## 💡 Pro Tips

1. **Always use** `stop-all.bat` before shutting down your computer
2. **Bookmark** http://localhost:5173 in your browser
3. **Keep terminal windows open** while using the app
4. **Check logs folder** if you encounter issues

---

## 📞 Need Help?

Check the error logs in `logs/error.log` for details about any issues.

---

**Made with ❤️ | Employee Feedback Agent**
