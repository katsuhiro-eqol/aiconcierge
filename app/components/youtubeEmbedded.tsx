type Props = {
    videoId: string; // 例: "dQw4w9WgXcQ"
    title?: string;
    start?: number; // 再生開始秒
  };
  
  export default function YouTubeEmbed({ videoId, title = "YouTube video", start }: Props) {
    const src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1${
      start ? `&start=${start}` : ""
    }`;
  
    return (
      <div className="relative w-full overflow-hidden rounded-2xl shadow-md" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          className="absolute left-0 top-0 h-full w-full"
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }