# Live Face Matching Guide

## Overview
This React Native application implements real-time face matching using the Regula Face SDK. It captures live images from the front camera and compares them against a database of employee images stored in JSON format.

## How It Works

### 1. **Data Structure**
Employee data is stored in `src/data/employees.json`:
```json
[
  {
    "id": "EMP001",
    "name": "Virat Kohli",
    "image": "https://example.com/image.jpg"
  }
]
```

### 2. **Live Image Capture**
- Uses `react-native-vision-camera` for front camera access
- Captures high-quality photos when user taps the capture button
- Converts captured image to base64 format for processing

### 3. **Image Caching System**
- Employee images are cached as base64 on app startup
- Progress bar shows caching status
- Failed images can be retried
- Cached images improve matching speed

### 4. **Face Matching Process**
```typescript
// Live image from camera
const liveImage = new MatchFacesImage(base64Live, ImageType.LIVE);

// Reference image from JSON
const refImage = new MatchFacesImage(emp.base64, ImageType.PRINTED);

// Compare faces
const request = new MatchFacesRequest([refImage, liveImage]);
const response = await FaceSDK.instance.matchFaces(request);
```

### 5. **Matching Threshold**
- **85% similarity** required for a successful match
- Shows best match even if below threshold
- Provides detailed feedback on match quality

## Key Features

### ✅ **Real-time Processing**
- Live camera feed with instant capture
- Real-time status updates during matching
- Progress indicators for each step

### ✅ **Robust Error Handling**
- Network error handling for image loading
- Camera permission management
- Graceful fallbacks for failed matches

### ✅ **User Feedback**
- Success/failure popups with details
- Match similarity percentage
- Timestamp and date for successful matches

### ✅ **Performance Optimizations**
- Image caching reduces network requests
- Parallel processing where possible
- Memory-efficient base64 handling

## Usage Flow

1. **App Startup**: Employee images are cached from JSON URLs
2. **Camera Ready**: Front camera initializes and shows live feed
3. **Capture**: User taps button to capture live image
4. **Processing**: Image converted to base64 and compared
5. **Matching**: Each employee image compared against live capture
6. **Result**: Success popup with details or failure message

## Configuration

### Match Threshold
```typescript
// In CustomCameraCapture.tsx
if (matched?.similarity >= 0.85) { // 85% threshold
  // Success match
}
```

### Image Quality
```typescript
// In captureFrame.ts
const photo = await cameraRef.current.takePhoto({
  flash: 'off',
  quality: 0.9 // High quality for better matching
});
```

## Troubleshooting

### Common Issues

1. **No Camera Access**
   - Check camera permissions
   - Ensure device has front camera

2. **Poor Match Quality**
   - Ensure good lighting
   - Face should be clearly visible
   - Reduce distance from camera

3. **Slow Performance**
   - Check network connection for image loading
   - Reduce number of employee images
   - Clear app cache if needed

4. **No Matches Found**
   - Verify employee images are accessible
   - Check image quality and format
   - Ensure faces are clearly visible in reference images

## Technical Details

### Dependencies
- `react-native-vision-camera`: Camera access
- `@regulaforensics/face-sdk`: Face matching engine
- `react-native-fs`: File system operations

### Performance Metrics
- **Capture Time**: ~1-2 seconds
- **Processing Time**: ~2-5 seconds per employee
- **Match Accuracy**: 85%+ threshold for reliable results

### Memory Usage
- Base64 images cached in memory
- Automatic cleanup on component unmount
- Progress tracking for large datasets

## Best Practices

1. **Image Quality**: Use high-quality, well-lit employee photos
2. **Network**: Ensure stable internet for initial image loading
3. **Lighting**: Good lighting improves match accuracy
4. **Distance**: Position face 20-30cm from camera
5. **Updates**: Regularly update employee photos for accuracy

## Future Enhancements

- [ ] Offline image storage
- [ ] Batch processing for multiple faces
- [ ] Liveness detection
- [ ] Attendance logging
- [ ] Real-time video processing 