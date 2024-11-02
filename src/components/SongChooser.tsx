import { ChangeEvent, useEffect, useState } from 'react';
import { spotifyAccessTokenKey } from './utils';
import { getSpotifyData } from './getSpotifyData';
import { AuthenticationButton } from './AuthenticationButton';
import sampleSongs from './my_tracks.json';

export interface Song {
  id: string;
  previewUrl: string;
  name: string;
  href: string;
  artists: Array<{ name: string }>;
  albumName: string;
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  type: string;
  uri: string;
  track_href: string;
  analysis_url: string;
  duration_ms: number;
  time_signature: number;
}

interface SongChooserProps {
  onClick: (s: Song) => void;
}

export const SongChooserTable = (props: SongChooserProps) => {
  const [songs, setSongs] = useState<Array<Song>>([]);
  const [displaySongs, setDisplaySongs] = useState<Array<Song>>([]);
  const [loading, setLoading] = useState(false);
  const storedAccessToken = localStorage.getItem(spotifyAccessTokenKey);
  useEffect(() => {
    if (storedAccessToken !== null) {
      getSpotifyData(storedAccessToken).then((d) => {
        setSongs(d);
        setDisplaySongs(d);
        setLoading(false);
      });
    }
  }, [storedAccessToken]);

  const handleSearchArtistChange = (e: ChangeEvent<HTMLInputElement>) => {
    const lowerCaseArtist = e.target.value.toLowerCase();
    setDisplaySongs(
      songs.filter((song) =>
        song.artists[0].name.toLowerCase().includes(lowerCaseArtist),
      ),
    );
  };
  const handleSearchSongTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const lowerCaseSongTitle = e.target.value.toLowerCase();
    setDisplaySongs(
      songs.filter((song) =>
        song.name.toLowerCase().includes(lowerCaseSongTitle),
      ),
    );
  };

  if (displaySongs.length == 0) {
    if (loading) {
      return (
        <div className="w-full h-full flex flex-col justify-center items-center">
          <p className="text-2xl font-bold text-pink-600">Loading....</p>
        </div>
      );
    } else
      return (
        <div className="w-full h-full flex flex-col justify-center items-center gap-8 px-20">
          <div>
            <p className="font-bold text-xl">
              Have a Spotify account? Click the green button below to connect
              and see your songs.
            </p>
            <AuthenticationButton onAuthenticate={() => setLoading(true)} />
          </div>
          <div>
            <p className="font-bold text-xl">
              No Spotify account? No problem! Click the purple button below to
              see a set of sample songs.
            </p>
            <button
              className={`rounded w-fit h-fit bg-violet-600 text-[#efefef] font-bold cursor-pointer p-2`}
              onClick={() => setDisplaySongs(sampleSongs.tracks as Array<Song>)}
            >
              Show sample songs
            </button>
          </div>
        </div>
      );
  }

  return (
    <div className="min-w-fit flex flex-col gap-2 h-full">
      <div className="flex flex-row gap-1">
        <label htmlFor="song">Song Title</label>
        <input type="text" id="song" onChange={handleSearchSongTitleChange} />
        <label htmlFor="artist">Artist</label>
        <input type="select" id="artist" onChange={handleSearchArtistChange} />
      </div>
      <div className="overflow-y-auto max-h-full">
        <table className="table-auto overflow-auto">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th>song name</th>
              <th>artist</th>
              <th>album</th>
            </tr>
          </thead>
          <tbody>
            {displaySongs
              .filter((d) => d.previewUrl)
              .map((d) => (
                <tr
                  key={d.id}
                  onClick={() => props.onClick(d)}
                  className="cursor-pointer hover:bg-blue-100 border-b-2"
                >
                  <td className="max-w-60 flex flex-row justify-start align-top">
                    {d.name}
                  </td>
                  <td className="w-60">{d.artists[0].name}</td>
                  <td>{d.albumName}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
