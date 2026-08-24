Drop real camera plates here if you want to replace the drawn feeds.

Name them cam1.mp4 ... cam9.mp4, then in screens/cameras.html swap the
<canvas> inside each .tile for:

    <video src="../media/cam1.mp4" autoplay muted loop playsinline></video>

The OSD overlay (camera ID, timestamp, REC dot, LOOP INJECTED badge) sits
above it and keeps working untouched.
