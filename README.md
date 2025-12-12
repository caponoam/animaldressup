# Dress It Up! 🐻👗

A fun, interactive mobile game for kids where they can dress up adorable animals using simple drag-and-drop mechanics.

## Features

-   **Multiple Animals**: Choose from Bears, Cats, Dogs, and more!
-   **Wardrobe**: Mix and match Tops, Hats, Shoes, and Accessories.
-   **Drag & Drop**: Intuitive interface designed for children.
-   **RTL Support**: Full layout optimization for Right-to-Left languages (Hebrew/Arabic).
-   **Tablet Ready**: Optimized for larger screens like the Pixel Tablet.

## Tech Stack

-   **React Native**
-   **Expo** (Managed Workflow)
-   **Reanimated** (High-performance animations)
-   **Expo Image** (Optimized asset loading)

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```

2.  **Start the App**:
    ```bash
    npx expo start
    ```

3.  **Run on Device**:
    -   Scan the QR code with the **Expo Go** app (Android/iOS).
    -   Or press `a` for Android Emulator, `i` for iOS Simulator.

## Building for Release using Expo Prebuild

To build the Android App Bundle (`.aab`) for the Play Store:

1.  **Sync Native Project**:
    ```bash
    npx expo prebuild --platform android
    ```

2.  **Generate Release Key** (One time setup):
    *Ensure you have a `upload-keystore.jks` in `android/app` and configured in `android/gradle.properties`.*

3.  **Build Bundle**:
    ```bash
    cd android && ./gradlew bundleRelease
    ```

The output file will be at `android/app/build/outputs/bundle/release/app-release.aab`.

## License

Copyright © 2024 Animal Dress Up. All rights reserved.
