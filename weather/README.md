# Weather Video Assets

To enable dynamic video backgrounds for rain and snow, please download MP4 video files and place them in this folder (`public/weather/`).

## Expected Files:
1.  **rain.mp4**: A looping video of rain falling.
2.  **snow.mp4**: A looping video of snow falling.
3.  **storm.mp4**: A looping video of a thunderstorm (optional, otherwise the rain video and CSS lightning will be used).

## How to use:
- Find high-quality, seamless looping videos online (e.g., from Pexels, Pixabay, or other stock footage sites).
- Rename the downloaded files to match the names above EXACTLY.
- Place them in this folder.
- The application will automatically detect and play these videos when the corresponding weather condition is active.

## Notes:
- Ensure the videos are optimized for web (H.264 format, reasonable bitrate) to avoid performance issues.
- If a file is missing, the application will attempt to use the CSS fallback.
