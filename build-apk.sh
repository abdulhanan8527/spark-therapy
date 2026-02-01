#!/bin/bash
# Android APK Build Script for SPARKTherapy

echo "🚀 Building SPARKTherapy Android APK..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo -e "${YELLOW}⚠️  Expo CLI not found, installing...${NC}"
    npm install -g @expo/cli
fi

# Navigate to project directory
cd /home/abdul-hanan/Downloads/New/SPARKTherapy

# Install/update dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚠️  EAS CLI not found, installing...${NC}"
    npm install -g eas-cli
fi

# Configure EAS if not already configured
if [ ! -f "eas.json" ]; then
    echo -e "${YELLOW}⚙️  Configuring EAS build...${NC}"
    npx eas build:configure
fi

# Build for Android
echo -e "${GREEN}📱 Starting Android build...${NC}"
echo -e "${YELLOW}This may take 10-20 minutes${NC}"

# Build APK (unsigned, for testing/distribution)
npx eas build --platform android --profile production --non-interactive

echo -e "${GREEN}✅ Build submitted successfully!${NC}"
echo -e "${BLUE}🔗 Track your build progress at:${NC}"
echo "   https://expo.dev/accounts/YOUR_USERNAME/projects/sparktherapy/builds"

echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "1. Wait for build completion (check email or Expo dashboard)"
echo "2. Download the APK from Expo dashboard"
echo "3. Distribute to your users"
echo "4. For Google Play Store submission, you'll need to create a signed APK"

# Alternative: Build using Expo Application Services (EAS)
echo ""
echo -e "${BLUE}🔧 Alternative build methods:${NC}"
echo "1. Local build (requires Android Studio):"
echo "   npx expo run:android --variant release"
echo ""
echo "2. Development build (for testing):"
echo "   npx expo build:android"