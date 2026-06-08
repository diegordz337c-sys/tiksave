export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  const response = await fetch(
    `https://tiktok-video-no-watermark2.p.rapidapi.com/?url=${encodeURIComponent(url)}&hd=1`,
    {
      headers: {
        "x-rapidapi-key": "203c52e2f0mshda188cabbc17962p150ea1jsnc5395f36608a",
        "x-rapidapi-host": "tiktok-video-no-watermark2.p.rapidapi.com",
      },
    }
  );

  const data = await response.json();
  return Response.json(data);
}