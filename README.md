<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/18gNoI9N6RUUSf3z0gfKWJYL8bQKeWqwx

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env` file in the project root (or update the existing one) and add the following keys:

   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   VITE_GEOAPIFY_API_KEY=your_geoapify_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   ```

   Replace the values with your actual API keys.

3. Run the app:
   `npm run dev`
