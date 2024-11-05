import { useQuery } from '@tanstack/react-query';
import { getSpotifyData } from './getSpotifyData';

export const useSongData = (storedAccessToken: string | null) =>
  useQuery({
    queryKey: ['songs-spotify'],
    queryFn: async () => {
      if (storedAccessToken) {
        const result = await getSpotifyData(storedAccessToken);
        return result;
      }
    },
    enabled: !!storedAccessToken,
  });
