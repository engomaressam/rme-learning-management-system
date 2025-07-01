# 🚀 RME LMS Quick Startup Guide

This guide shows you how to quickly start the RME Learning Management System with a single click.

## 📁 Available Startup Scripts

We've created 3 different startup scripts for your convenience:

### 1. **start-lms.bat** (Recommended for Windows)
- **Windows Batch File** - Just double-click to run
- ✅ **Easiest option** - No additional software needed
- ✅ Works on all Windows versions
- ✅ Shows colored output and progress

### 2. **start-lms.ps1** (PowerShell)
- **PowerShell Script** - Right-click → "Run with PowerShell"
- ✅ Enhanced colors and formatting
- ⚠️ May require execution policy changes (see below)

### 3. **start-lms.py** (Python)
- **Python Script** - Double-click if Python is installed
- ✅ Cross-platform (Windows/Mac/Linux)
- ⚠️ Requires Python 3.6+ to be installed

## 🎯 Quick Start (Recommended)

**For most users, simply:**

1. **Close all existing terminals** that are running the LMS
2. **Double-click** `start-lms.bat` in the root folder
3. **Wait** for the startup process (about 30 seconds)
4. **Browser will open automatically** to http://10.10.11.243:5173

## 🔐 Login Credentials

```
👑 Admin Access:
Email:    admin@company.com
Password: admin123

👤 Employee Access:
Email:    employee1@company.com
Password: password123

👨‍🏫 Trainer Access:
Email:    trainer1@company.com
Password: password123

👔 Manager Access:
Email:    manager1@company.com
Password: password123
```

## 🌐 Network Access

The system is configured to allow access from any device on your network:

- **Frontend (React App):** http://10.10.11.243:5173
- **Backend (API):** http://10.10.11.243:3001
- **Health Check:** http://10.10.11.243:3001/health

Your colleagues can now access the LMS from their laptops/PCs using the same URL!

## 📝 What the Scripts Do

1. **Build shared package** - Compiles TypeScript types and validation
2. **Start backend server** - Launches API server on port 3001
3. **Build frontend** - Creates optimized React production build
4. **Start frontend server** - Serves the app on port 5173
5. **Open browser** - Automatically navigates to the login page

## ⚠️ Troubleshooting

### PowerShell Execution Policy Error
If you see `execution of scripts is disabled on this system`:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
If you see port conflicts:
1. Close all existing LMS terminals
2. Run the startup script again
3. Or restart your computer if issues persist

### Python Not Found
If `.py` files don't run:
1. Install Python from python.org
2. Make sure "Add Python to PATH" is checked during installation
3. Or just use the `.bat` file instead

### Network Access Issues
If other devices can't connect:
1. Check Windows Firewall settings
2. Make sure ports 3001 and 5173 are allowed
3. Verify your IP address is still 10.10.11.243

## 📁 File Structure After Startup

```
lms/
├── start-lms.bat          ← Click this!
├── start-lms.ps1          ← Or this (PowerShell)
├── start-lms.py           ← Or this (Python)
├── backend/               ← API Server (Port 3001)
├── frontend/              ← React App (Port 5173)
│   ├── dist/             ← Built files (auto-generated)
│   └── server.js         ← Production server
└── shared/               ← Common code
    └── dist/             ← Built files (auto-generated)
```

## 🎉 Success Indicators

You'll know everything is working when you see:

✅ **Backend**: Console shows "🚀 RME LMS API Server started on port 3001"  
✅ **Frontend**: Console shows "🎉 RME LMS Frontend Server is running!"  
✅ **Browser**: Opens automatically to login page  
✅ **Network**: Other devices can access http://10.10.11.243:5173  

## 🛑 Stopping the System

To stop all servers:
1. Close the terminal windows that opened
2. Or press `Ctrl+C` in each terminal
3. The system will shutdown gracefully

---

**Need help?** The startup scripts include detailed error messages and troubleshooting tips. 