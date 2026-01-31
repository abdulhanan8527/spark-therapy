# APK Build Instructions for SPARK Therapy App

## Method 1: Using Android Studio (Recommended)

1. Open Android Studio
2. Select "Open an existing Android Studio project"
3. Navigate to `spark-therapy-mobile\SparkTherapyApp\android` and select the `android` folder
4. Wait for Gradle sync to complete
5. Connect your Android device or start an emulator
6. Click the green "Run" button or press Shift+F10
7. Once the app runs successfully, go to "Build" menu
8. Select "Build Bundle(s) / APK(s)" > "Build APK(s)"
9. Wait for the build to complete
10. Click "locate" in the notification to find your APK

## Method 2: Using Command Line (If Method 1 doesn't work)

1. Open Command Prompt or PowerShell
2. Navigate to the project directory:
   ```
   cd spark-therapy-mobile\SparkTherapyApp
   ```
3. Run the following command:
   ```
   npx react-native build-android
   ```
4. If you encounter NDK issues, you may need to:
   - Open Android Studio
   - Go to Tools > SDK Manager
   - In the SDK Tools tab, check "Show Package Details"
   - Under NDK (Side by side), uninstall version 27.1.12297006
   - Install version 25.1.8937393 instead

## Troubleshooting

### If you get NDK errors:
1. Open Android Studio
2. Go to File > Settings (or Android Studio > Preferences on macOS)
3. Navigate to Appearance & Behavior > System Settings > Android SDK
4. Click on the "SDK Tools" tab
5. Check "Show Package Details"
6. Expand "NDK (Side by side)"
7. Uncheck version 27.1.12297006
8. Check version 25.1.8937393
9. Click "Apply" and "OK"
10. Try building again

### If you get AndroidX errors:
1. Open `android/gradle.properties`
2. Add the following line:
   ```
   android.useAndroidX=true
   ```
3. Save the file and try building again

## Location of Generated APK

Once successfully built, the APK will be located at:
```
spark-therapy-mobile\SparkTherapyApp\android\app\build\outputs\apk\debug\app-debug.apk
```

## Installing the APK on Your Device

1. Transfer the APK file to your Android device
2. On your Android device, go to Settings > Security
3. Enable "Unknown sources" or "Install unknown apps"
4. Open the file manager on your device
5. Navigate to where you saved the APK file
6. Tap on the APK file to install it
7. Follow the on-screen instructions to complete the installation