export default function ({ route, redirect }) {
  const path = route.path;

  if (path.includes('/youtube/view/')) {
    const newPath = path.replace('/youtube/view/', '/video-view/youtube/');
    return redirect(newPath);
  }
  if (route.fullPath === '/zh/en/online-courses') {
    return redirect('https://m.cctalk.com/inst/stevmab3');
  }
  if (route.fullPath === '/en/zh/online-courses') {
    return redirect('https://chinesezerotohero.teachable.com/');
  }
}