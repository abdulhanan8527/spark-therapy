#!/bin/bash

# SPARK Therapy - Client Build Script
# Creates production APK and IPA with configurable backend

echo "🚀 Building SPARK Therapy for Client Distribution"
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Get client's backend URL
print_status "Enter your client's backend URL:"
print_status "Example: https://api.clientcompany.com"
read -p "Backend URL: " CLIENT_BACKEND

if [ -z "$CLIENT_BACKEND" ]; then
    print_error "Backend URL is required"
    exit 1
fi

# Remove trailing slash
CLIENT_BACKEND=$(echo "$CLIENT_BACKEND" | sed 's/\/$//')
API_URL="${CLIENT_BACKEND}/api"

print_status "Configuring app for backend: $CLIENT_BACKEND"
print_status "API URL: $API_URL"

# Create production environment file
cat > .env.production << EOF
REACT_APP_API_BASE_URL=${API_URL}
REACT_APP_BACKEND_URL=${CLIENT_BACKEND}
NODE_ENV=production
GENERATE_SOURCEMAP=false
EOF

print_success "Environment configured"

# Install dependencies
print_status "Installing dependencies..."
npm install --silent

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

print_success "Dependencies installed"

# Build Android APK
print_status "Building Android APK..."
cd android

# Clean previous builds
./gradlew clean --quiet

# Build release APK
./gradlew assembleRelease --quiet

if [ $? -eq 0 ]; then
    print_success "Android APK built successfully!"
    
    # Copy to project root with client name
    APK_NAME="SPARK-Therapy-Android-$(date +%Y%m%d).apk"
    cp app/build/outputs/apk/release/app-release.apk "../$APK_NAME"
    print_success "APK saved as: $APK_NAME"
else
    print_error "Android build failed"
fi

cd ..

# Build iOS (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_status "Building iOS app..."
    
    cd ios
    
    # Clean previous builds
    rm -rf build/
    
    # Install pods if needed
    if [ ! -d "Pods" ]; then
        pod install --silent
    fi
    
    # Build archive
    xcodebuild archive \
        -workspace SPARK.xcworkspace \
        -scheme SPARK \
        -configuration Release \
        -archivePath build/SPARK.xcarchive \
        CODE_SIGNING_ALLOWED=NO \
        -quiet
    
    if [ $? -eq 0 ]; then
        print_success "iOS archive built successfully!"
        
        # Create export options plist
        cat > ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>enterprise</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
EOF
        
        # Export IPA
        xcodebuild -exportArchive \
            -archivePath build/SPARK.xcarchive \
            -exportPath build/Export \
            -exportOptionsPlist ExportOptions.plist \
            -quiet
            
        if [ $? -eq 0 ]; then
            IPA_NAME="SPARK-Therapy-iOS-$(date +%Y%m%d).ipa"
            cp build/Export/SPARK.ipa "../$IPA_NAME"
            print_success "IPA saved as: $IPA_NAME"
        fi
    else
        print_error "iOS build failed"
    fi
    
    cd ..
else
    print_warning "iOS build requires macOS with Xcode"
fi

# Create client instructions
INSTRUCTIONS="SPARK-Therapy-Instructions-$(date +%Y%m%d).txt"
cat > "$INSTRUCTIONS" << EOF
SPARK Therapy Mobile App - Client Installation Guide
====================================================

Build Date: $(date)
Configured Backend: ${CLIENT_BACKEND}

FILES INCLUDED:
===============

1. ${APK_NAME:-SPARK-Therapy-Android-YYYYMMDD.apk}
   - Android application package
   - Install on Android devices (Android 6.0+)
   - Size: ~$(ls -lh ${APK_NAME:-SPARK-Therapy-Android-YYYYMMDD.apk} 2>/dev/null | awk '{print $5}' || echo "N/A")

2. ${IPA_NAME:-SPARK-Therapy-iOS-YYYYMMDD.ipa} (if built)
   - iOS application package
   - Requires Apple Configurator or MDM for installation
   - Size: ~$(ls -lh ${IPA_NAME:-SPARK-Therapy-iOS-YYYYMMDD.ipa} 2>/dev/null | awk '{print $5}' || echo "N/A")

INSTALLATION INSTRUCTIONS:
=========================

ANDROID:
--------
1. Transfer the APK file to Android device
2. Enable "Install from unknown sources" in Settings
3. Open the APK file to install
4. Launch the SPARK Therapy app

IOS:
----
1. Connect iOS device to computer with iTunes/Apple Configurator
2. Drag and drop the IPA file to install
3. Or use your company's MDM solution
4. Trust the developer profile in Settings > General > Device Management

CONFIGURATION:
==============
The app is pre-configured to connect to:
Backend URL: ${CLIENT_BACKEND}
API Endpoint: ${API_URL}

TESTING:
========
After installation, test these features:
1. Registration screen - should connect to your backend
2. Login functionality
3. All API calls should work with your server
4. PDF viewing and other features

SUPPORT:
========
If you encounter issues:
- Verify backend server is accessible
- Check SSL certificates (HTTPS)
- Ensure CORS is properly configured
- Confirm API endpoints match expected format

Backend API Requirements:
- POST /api/auth/register
- POST /api/auth/login  
- GET /api/health
- All other endpoints as documented

Contact: Your development team for technical support
EOF

print_success "Instructions file created: $INSTRUCTIONS"

echo ""
echo "================================================"
print_success "BUILD COMPLETE!"
echo "================================================"
print_status "Generated files:"
echo "  📱 $APK_NAME"
if [[ "$OSTYPE" == "darwin"* ]] && [ -f "$IPA_NAME" ]; then
    echo "  🍎 $IPA_NAME"
fi
echo "  📄 $INSTRUCTIONS"
echo ""
print_status "Your apps are ready for client distribution!"
print_status "They will connect to: ${CLIENT_BACKEND}"
echo "================================================"