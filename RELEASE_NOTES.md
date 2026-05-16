# Release Notes

## Version 2.4.0 - "The Red Panda" 🐾✨

### **New Character**
*   **Red Panda Added**: Welcome our new friend, the Red Panda! The acrobat of the trees is ready for dress-up adventures.
*   **Custom Fitting & Overlays**:
    *   The Red Panda now has specialized "Fits" for all hats, glasses, and accessories.
    *   **High-Quality Composites**: Added four custom outfits for the Red Panda (Red Shirt, Hawaiian Shirt, Dress Shirt, and the Gi).

### **New Content**
*   **Ancient Egypt Background**: A new desert landscape with pyramids.
*   **Lei Accessory**: A colorful flower necklace.
`
---

## Version 2.3.0 - "The Koala Kid" 🐨✨
 
### **New Character**
*   **Koala Added**: Welcome our new friend, the Koala! A laid-back climber ready for high-fashion adventures.
*   **Custom Fitting & Overlays**:
    *   The Koala now has specialized "Fits" for all hats, glasses, and accessories.
    *   **High-Quality Composites**: Added four custom outfits for the Koala (Red Shirt, Hawaiian Shirt, Dress Shirt, and the Gi) so items wrap perfectly around its unique shape.
 
### **System Improvements**
*   **Asset Consistency**: Standardized all character and composite assets to 1024x1024 and 800x800 respectively for optimal performance and visual clarity.
*   **Performance Build**: Upgraded build configurations for a smoother Play Store experience.

## Version 1.3.0 - "The Big Update" 🐻✨

### **Major Features**
*   **Persistent Storage**: Your outfits are now saved forever! We added a specialized storage system so your gallery loads instantly every time you open the app.
*   **Smart Save System**:
    *   **Overwrite Support**: Saving an outfit you're already working on now *updates* it instead of creating a clutter of duplicates.
    *   **Pre-fill Names**: The app remembers the name of the outfit you're editing.
    *   **Delete Option**: Added a delete button (❌) to the gallery to remove unwanted outfits.
*   **Drag-and-Drop Spawning**: Dragging an item directly from the drawer now places it exactly where you drop it on the screen.

### **Visual & UX Improvements**
*   **Massive Characters**: We standardized all animals and accessories to **600px** (up from 300px). They are now huge, detailed, and fill the screen beautifully.
*   **Gallery Thumbnails**: Updated the gallery generation to correctly scale these new massive animals into tidy little thumbnails.
*   **Restored "About" Page**: The missing Help/About button (?) has been returned to the main screen.

### **Bug Fixes**
*   **Theme Fix**: Resolved an issue where the background would turn black when entering dress-up mode.
*   **Layering Fix**: Fixed a bug where the animal Base Layer was intercepting touch events, making it hard to drag accessories on top of it.
*   **Crash Fix**: Added robust safety checks to prevent crashes when saving outfits with irregular data.

### **Technical Details**
*   Migrated to String-based IDs (`'bear'`, `'hat_fedora'`) for robust asset mapping.
*   Implemented `AsyncStorage` for local data persistence.
*   Refactored `SlidingDrawer` and `DraggableAccessor` coordinate systems.
