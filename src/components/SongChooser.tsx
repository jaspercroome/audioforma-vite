import { ChangeEvent, useEffect, useState } from 'react';
import {
  Song,
  // spotifyAccessTokenKey
} from './utils';
// import { AuthenticationButton } from './AuthenticationButton';
import sampleSongs from './my_tracks.json';
// import { useSongData } from './useSongData';

interface SongChooserProps {
  onClick: (s: Song) => void;
  selectedSong?: Song;
}

export const SongChooserTable = (props: SongChooserProps) => {
  const { onClick, selectedSong } = props;
  const [songs, setSongs] = useState<Array<Song>>([]);
  const [displaySongs, setDisplaySongs] = useState<Array<Song>>([]);
  // const storedAccessToken = localStorage.getItem(spotifyAccessTokenKey);

  const songData = sampleSongs.tracks as Array<Song>;

  // const {
  //   data: songData,
  //   isLoading,
  //   isFetched,
  // } = useSongData(storedAccessToken);

  useEffect(() => {
    if (songData) {
      songData.sort((a, b) =>
        a.artists[0].name.localeCompare(b.artists[0].name),
      );
      setSongs(songData);
      setDisplaySongs(songData);
      console.log(songData);
    }
  }, [songData]);

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

  // if (displaySongs.length == 0) {
  // if (isLoading) {
  //   return (
  //     <div className="w-full h-full flex flex-col justify-center items-center">
  //       <p className="text-2xl font-bold text-pink-600">Loading....</p>
  //     </div>
  //   );
  // } else if (!isFetched) {
  // return (
  //   <div className="w-full h-full flex flex-col justify-center items-center gap-8 px-20">
  //     <div>
  //       <p className="font-bold text-xl">
  //         Have a Spotify account? Click the green button below to connect and
  //         see your songs.
  //       </p>
  //       <AuthenticationButton
  //         onAuthenticate={() => {
  //           window.location.reload();
  //         }}
  //       />
  //     </div>
  //     <div>
  //       <p className="font-bold text-xl">
  //         No Spotify account? No problem! Click the purple button below to see
  //         a set of sample songs.
  //       </p>
  //       <button
  //         className={`rounded w-fit h-fit bg-violet-600 text-[#efefef] font-bold cursor-pointer p-2`}
  //         onClick={() => setDisplaySongs(sampleSongs.tracks as Array<Song>)}
  //       >
  //         Show sample songs
  //       </button>
  //     </div>
  //   </div>
  // );
  // }
  // }

  return (
    <div className="min-w-fit flex flex-col gap-2 h-full">
      <div className="flex flex-row gap-1">
        <label htmlFor="song">Song Title</label>
        <input
          type="text"
          id="song"
          onChange={handleSearchSongTitleChange}
          className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
          placeholder="Song title"
        />
        <label htmlFor="artist">Artist</label>
        <input
          type="select"
          id="artist"
          onChange={handleSearchArtistChange}
          className='className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
          '
          placeholder="Artist name"
        />
      </div>
      <div className="overflow-y-auto max-h-full">
        {displaySongs.length > 0 ? (
          <table className="table-auto overflow-y-auto w-full">
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
                    onClick={() => onClick(d)}
                    className={`w-full cursor-pointer hover:bg-blue-100 border-b-2 ${
                      d.id === selectedSong?.id && 'bg-blue-200'
                    }`}
                  >
                    <td className="max-w-24 flex justify-start">
                      {d.name.includes(' ') ? d.name : d.name.slice(0, 16)}
                    </td>
                    <td className="w-fit">{d.artists[0].name}</td>
                    <td className="w-fit">{d.albumName}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <p className="text-lg font-bold">no songs found</p>
        )}
      </div>
    </div>
  );
};
