import { Song } from './SongChooser';

export const getSpotifyData = async (
  accessToken: string,
): Promise<Array<Song>> => {
  const songData = await getMySongData(accessToken);
  const songIds = songData.map((song) => song?.id ?? '');
  const songAudioFeatures = (
    await getSongAudioFeatures(songIds, accessToken)
  ).filter((item) => !!item);
  const compiledData = songData.map((song) => {
    const audioFeatures = songAudioFeatures.find((af) => af.id === song.id);
    return { ...song, ...audioFeatures };
  });
  return compiledData;
};

const getMySongData = async (
  accessToken: string,
  url?: string,
  accumulatedData: Array<{
    id: string;
    previewUrl: string;
    name: string;
    href: string;
    albumName: string;
    artists: Array<{ name: string }>;
  }> = [],
): Promise<
  Array<{
    id: string;
    previewUrl: string;
    artists: Array<{ name: string }>;
    albumName: string;
    name: string;
    href: string;
    type: string;
    uri: string;
    track_href: string;
    analysis_url: string;
    duration_ms: string;
  }>
> => {
  const defaultUrl = 'https://api.spotify.com/v1/me/tracks?limit=50';
  const response = await fetch(url ?? defaultUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data: {
    next: string | null;
    items: Array<{
      added: string;
      track: {
        id: string;
        album: { name: string };
        name: string;
        href: string;
        preview_url: string;
        artists: Array<{ name: string }>;
      };
    }>;
  } = await response.json();

  // Accumulate items from the current response
  const allData = accumulatedData.concat(
    data.items.map((item) => ({
      id: item.track.id,
      previewUrl: item.track.preview_url,
      name: item.track.name,
      href: item.track.href,
      albumName: item.track.album.name,
      artists: item.track.artists.map((a) => ({ name: a.name })),
    })),
  );

  // If there's a next page, continue fetching recursively
  if (data.next) {
    return await getMySongData(accessToken, data.next, allData);
  }

  // If there's no next page, return all collected items
  return allData;
};
const getSongAudioFeatures = async (
  idList: Array<string>,
  accessToken: string,
): Promise<
  Array<{
    id: string;
    danceability: number;
    energy: number;
    key: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    loudness: number;
    liveness: number;
    tempo: number;
    valence: number;
    time_signature: number;
  }>
> => {
  const songCount = idList.length;
  let incrementor = 0;
  const songFeatures: Array<Song> = [];
  while (incrementor <= songCount) {
    const limit = incrementor + 99;
    const slicedIds = idList.slice(incrementor, limit).join('%2C');
    const response = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${slicedIds}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    const data = await response.json();
    const audioFeatures = data.audio_features;
    songFeatures.push(...audioFeatures);
    incrementor += 100;
  }
  return songFeatures;
};
