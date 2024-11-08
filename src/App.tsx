import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Analytics } from '@vercel/analytics/react';
import { Suspense, useEffect, useState } from 'react';

import './App.css';
import { CircleFifthsChart } from './components/circleFifthsChart';
import { SongChooserTable } from './components/SongChooser';
import { Song } from './components/utils';

function App() {
  const [dimensions, setDimensions] = useState({ width: 500, height: 600 });
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [song, setSong] = useState<Song>();

  const queryClient = new QueryClient();

  useEffect(() => {
    setDimensions({
      width: Math.min(window.innerWidth, 400),
      height: window.innerHeight * 0.9,
    });
  }, []);

  const handleClick = (s: Song) => {
    setPreviewUrl(s.previewUrl);
    setSong(s);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col justify-start gap-2 h-[95vh]">
        <div className="flex flex-col md:flex-row gap-4 w-full h-4/5">
          <CircleFifthsChart
            previewUrl={previewUrl}
            width={dimensions.width}
            height={dimensions.height}
            song={song}
          />
          <Suspense fallback={<p>Loading...</p>}>
            <SongChooserTable onClick={handleClick} selectedSong={song} />
          </Suspense>
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
      <Analytics />
    </QueryClientProvider>
  );
}

export default App;
