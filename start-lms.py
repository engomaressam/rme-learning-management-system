#!/usr/bin/env python3
"""
RME Learning Management System Startup Script
Starts backend and frontend servers, then opens the browser
"""

import os
import sys
import time
import subprocess
import webbrowser
from pathlib import Path

def run_command(cmd, cwd=None, background=False):
    """Run a command in the specified directory"""
    try:
        if background:
            if os.name == 'nt':  # Windows
                subprocess.Popen(cmd, shell=True, cwd=cwd, 
                               creationflags=subprocess.CREATE_NEW_CONSOLE)
            else:  # Unix/Linux/Mac
                subprocess.Popen(cmd, shell=True, cwd=cwd)
        else:
            result = subprocess.run(cmd, shell=True, cwd=cwd, 
                                  capture_output=True, text=True)
            if result.returncode != 0:
                print(f"❌ Error running command: {cmd}")
                print(f"Error: {result.stderr}")
                return False
        return True
    except Exception as e:
        print(f"❌ Exception running command: {cmd}")
        print(f"Exception: {str(e)}")
        return False

def main():
    print("\n" + "="*55)
    print("            RME Learning Management System")
    print("="*55)
    print("\n🚀 Starting servers... Please wait...\n")
    
    # Get the script directory
    script_dir = Path(__file__).parent.absolute()
    
    # Step 1: Build shared package
    print("[1/4] Building shared package...")
    shared_dir = script_dir / "shared"
    if not run_command("npm run build", cwd=shared_dir):
        print("❌ Failed to build shared package")
        input("Press Enter to exit...")
        sys.exit(1)
    print("✅ Shared package built successfully")
    
    # Step 2: Start backend server
    print("\n[2/4] Starting Backend Server...")
    backend_dir = script_dir / "backend"
    if not run_command("npm run dev", cwd=backend_dir, background=True):
        print("❌ Failed to start backend server")
        input("Press Enter to exit...")
        sys.exit(1)
    print("✅ Backend server starting...")
    time.sleep(8)  # Wait for backend to start
    
    # Step 3: Build frontend
    print("\n[3/4] Building Frontend...")
    frontend_dir = script_dir / "frontend"
    if not run_command("npm run build", cwd=frontend_dir):
        print("❌ Failed to build frontend")
        input("Press Enter to exit...")
        sys.exit(1)
    print("✅ Frontend built successfully")
    
    # Step 4: Start frontend server
    print("\n[4/4] Starting Frontend Server...")
    if not run_command("node server.js", cwd=frontend_dir, background=True):
        print("❌ Failed to start frontend server")
        input("Press Enter to exit...")
        sys.exit(1)
    print("✅ Frontend server starting...")
    time.sleep(5)  # Wait for frontend to start
    
    # Success message
    print("\n" + "="*55)
    print("   🎉 RME LMS is running!")
    print("")
    print("   Backend:  http://10.10.11.243:3001")
    print("   Frontend: http://10.10.11.243:5173")
    print("")
    print("   Opening browser in 3 seconds...")
    print("="*55)
    
    # Open browser
    time.sleep(3)
    try:
        webbrowser.open("http://10.10.11.243:5173")
        print("\n✅ Browser opened successfully!")
    except Exception as e:
        print(f"\n⚠️  Could not open browser automatically: {str(e)}")
        print("Please manually open: http://10.10.11.243:5173")
    
    print("\n🎯 System started successfully!")
    print("📝 Login credentials:")
    print("   Admin: admin@company.com / admin123")
    print("   Employee: employee1@company.com / password123")
    print("\nYou can close this window now.")
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main() 