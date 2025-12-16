# Release Notes

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
