# PlayTorrio Android

This document provides instructions for building and running PlayTorrio as an Android application.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Android Studio** (latest version)
3. **Android SDK** (API level 24 or higher)
4. **Java Development Kit (JDK)** (version 17 or higher)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Android Studio

1. Open Android Studio
2. Go to **File > Settings > Appearance & Behavior > System Settings > Android SDK**
3. Install Android SDK Platform 34 (Android 14.0)
4. Install Android SDK Build-Tools
5. Set the `ANDROID_HOME` environment variable:

**Linux/macOS:**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows:**
```cmd
set ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\emulator
set PATH=%PATH%;%ANDROID_HOME%\platform-tools
```

## Building the App

### Development Build

1. Sync web assets with Android:
```bash
npm run android:sync
```

2. Open in Android Studio:
```bash
npm run android:open
```

3. Run on device/emulator from Android Studio, or use:
```bash
npm run android:run
```

### Debug APK Build

Build a debug APK:
```bash
npm run android:build
```

The APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK Build

1. Create a keystore (if you don't have one):
```bash
keytool -genkey -v -keystore playtorrio-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias playtorrio
```

2. Configure signing in `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('playtorrio-release-key.jks')
            storePassword 'your-store-password'
            keyAlias 'playtorrio'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. Build release APK:
```bash
npm run android:build:release
```

The signed APK will be located at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## App Features on Android

### Available Features
- ✅ Movie & TV Show browsing
- ✅ Search functionality
- ✅ Watchlist (My List)
- ✅ Done Watching history
- ✅ Continue Watching
- ✅ TMDB integration
- ✅ Trakt integration
- ✅ Anime browsing
- ✅ Books browsing
- ✅ Music streaming
- ✅ Games library
- ✅ Live TV
- ✅ In-app video player
- ✅ External player support (VLC for Android)
- ✅ Stremio addons

### Not Available on Android
- ❌ WebTorrent P2P streaming (requires server)
- ❌ Discord Rich Presence
- ❌ Chromecast (planned)
- ❌ Desktop window controls

## Streaming Architecture

The Android app operates in a **client-only mode**. For full torrent streaming functionality:

1. **Option A**: Host the server externally and configure the app to connect to it
2. **Option B**: Use Stremio-compatible addons that provide direct streams
3. **Option C**: Use Debrid services (Real-Debrid, AllDebrid, TorBox, Premiumize)

## Troubleshooting

### Build Errors

**Gradle sync failed:**
- Ensure Android Studio has downloaded all required SDK components
- Try: `cd android && ./gradlew clean`

**Missing SDK:**
- Open Android Studio > SDK Manager and install missing components

**Capacitor sync issues:**
```bash
npx cap sync android --force
```

### Runtime Issues

**White screen on launch:**
- Check browser console in Android Studio's Logcat
- Verify all assets are copied: `npx cap sync android`

**Network requests failing:**
- Verify `network_security_config.xml` allows required domains
- Check manifest has INTERNET permission

## Development

### Hot Reload

For development with live reload:

1. Start a local web server:
```bash
npx http-server public -p 8080
```

2. Update `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  // ... other config
  server: {
    url: 'http://YOUR_LOCAL_IP:8080',
    cleartext: true
  }
};
```

3. Sync and run:
```bash
npm run android:sync
npm run android:run
```

### Debugging

1. Connect device via USB with USB debugging enabled
2. Open Chrome and navigate to `chrome://inspect`
3. Click "inspect" on your device's WebView

## License

This project is for educational purposes only.
