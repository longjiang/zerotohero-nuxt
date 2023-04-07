export default function ({ route, redirect }) {
    const path = route.path;
  
    if (path.includes('/youtube/view/')) {
      const newPath = path.replace('/youtube/view/', '/video-view/youtube/');
      return redirect(newPath);
    }
  }