# Budget Planner

A simple and effective budget planning application with AI-powered insights using Gemini.

## Prerequisites
- Node.js (LTS version)
- npm (comes with Node.js)
- Gemini API Key (for AI features)

## Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API Key" in the left sidebar
4. Create a new API key or use an existing one
5. Keep this key secure - don't share it or commit it to version control

## Setup Instructions

1. **Install Node.js**
   - Download from [nodejs.org](https://nodejs.org/)
   - Run the installer and follow the steps
   - Verify installation:
     ```
     node -v
     npm -v
     ```

2. **Get the Project**
   - Download and extract the project files
   - Open the project folder in terminal

3. **Install Dependencies**
   ```
   npm install
   ```

4. **Set Up Environment Variables**
   - Create a new file named `.env.local` in the project root
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_api_key_here
     ```
   - Replace `your_api_key_here` with your actual Gemini API key
   - Save the file

5. **Start Development Server**
   ```
   npm run dev
   ```
   - This will show a local URL (usually http://localhost:5173)
   - Press Ctrl + Click the URL to open in browser

5. **Stop the Server**
   - Press `Ctrl + C` in the terminal
   - Type `Y` and press Enter if prompted
