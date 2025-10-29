# API Connection Setup Guide

## The Problem

You're getting "JSON Parse error: Unexpected character: <" because the mobile app can't reach your API at `http://affordaily-api.test`.

The `.test` domain only works on your local machine and won't be accessible from:
- Physical devices
- Android/iOS emulators
- Expo Go app

## Solutions

### Option 1: Use Your Computer's Local IP (Recommended for Physical Devices)

1. **Find your computer's IP address:**
   - **Mac/Linux:** Run `ifconfig | grep "inet "` or `ip addr`
   - **Windows:** Run `ipconfig` and look for IPv4 Address

2. **Update the API URL in `config/environment.ts`:**
   ```typescript
   // Replace with your actual IP address
   const API_URL = 'http://192.168.1.100:8000/api/v1';
   ```

3. **Make sure your Laravel API accepts connections from this IP:**
   ```bash
   # Run Laravel with --host flag
   php artisan serve --host=0.0.0.0 --port=8000
   ```

4. **Important:** Your phone/device must be on the same WiFi network as your computer!

### Option 2: Use Emulator-Specific Localhost (For Emulators Only)

#### Android Emulator
```typescript
// In config/environment.ts
const API_URL = 'http://10.0.2.2:8000/api/v1';
```
The special IP `10.0.2.2` maps to your host machine's localhost.

#### iOS Simulator
```typescript
// In config/environment.ts
const API_URL = 'http://localhost:8000/api/v1';
```
iOS Simulator can access localhost directly.

### Option 3: Use ngrok or Expose (For .test Domain or Any Setup)

If you want to keep using `affordaily-api.test` or need HTTPS:

1. **Install ngrok:** https://ngrok.com/download

2. **Run ngrok:**
   ```bash
   ngrok http affordaily-api.test:80
   ```

3. **Use the ngrok URL:**
   ```typescript
   // In config/environment.ts
   const API_URL = 'https://abc123.ngrok.io/api/v1';
   ```

### Option 4: Use Expo Tunnel

If using Expo Go:

```bash
# Start Expo with tunnel
npx expo start --tunnel
```

Then use your computer's IP as described in Option 1.

## How to Configure

1. Open `config/environment.ts`
2. Uncomment the appropriate `API_URL` line for your setup
3. Comment out the current `.test` URL
4. Restart your Expo dev server:
   ```bash
   npx expo start -c
   ```

## Testing Your Connection

After updating the URL, try these steps:

1. **Open your app and check the logs** - you'll now see detailed API request logs
2. **Look for:** 
   - "API Request: http://..." (should show your new URL)
   - "Response status: ..." (should be 200 for success)
   - Any error messages will now be more descriptive

3. **If you still see errors:**
   - Check if the Laravel API is running
   - Verify your firewall isn't blocking the connection
   - Ensure you're on the same network (for physical devices)
   - Check the Laravel logs for errors

## Quick Test

You can test if your API is accessible by opening this URL in your phone's browser:
```
http://YOUR_IP:8000/api/v1/
```

If you can't access it from your phone's browser, the app won't be able to either!

## Environment Variables (Optional Advanced Setup)

For a more robust setup, you can use environment variables:

1. Create `.env` file:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api/v1
   ```

2. Update `config/environment.ts`:
   ```typescript
   const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
   ```

3. Restart with:
   ```bash
   npx expo start -c
   ```

