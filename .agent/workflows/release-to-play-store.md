---
description: Build, verify, and release v2.3.0+ to the Play Store
---

This workflow automates the preparation and release process for the Animal Dress Up app.

## Prerequisites
- Ensure all assets (animals, clothes, composites) are resized and correctly configured in `data/animals.js` and `data/assets.js`.
- Key alias and passwords must be configured in `android/gradle.properties` or environment variables.

## Step 1: Quality & Testing
Before building, ensure the codebase is clean and meets quality standards.

// turbo
1. Run quality checks (Linter)
```bash
npm run lint
```

2. Run unit tests
```bash
npm test
```

## Step 2: Release Notes
Update the internal and external release logs.

3. Add new version entry to `RELEASE_NOTES.md` and `release-notes.txt`.
   - Highlight new animals or items.
   - Mention fitted overlays or performance improvements.

## Step 3: Distribution Prep
Bump versions across all relevant configuration files.

4. Update `version` and `versionCode`:
   - `package.json`: `version`
   - `app.json`: `version`, `android.versionCode`
   - `android/app/build.gradle`: `versionName`, `versionCode`

## Step 4: Build Release Artifact
Generate the Android App Bundle (AAB).

// turbo
5. Build the AAB
```bash
npm run android:build
```

## Step 5: Play Store Release
6. Upload the generated AAB to the Google Play Console.
   - Path: `android/app/build/outputs/bundle/release/app-release.aab`
   - Update the "What's new" section using `release-notes.txt`.
