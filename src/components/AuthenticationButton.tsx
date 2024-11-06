import { useEffect, useState } from 'react';
import { getAccessToken, getSpotifyAuthorization } from './spotifyAuth';
import {
  spotifyAccessTokenKey,
  spotifyExpiryKey,
  spotifyRefreshTokenKey,
} from './utils';

export const AuthenticationButton = (props: {
  onAuthenticate?: () => void;
}) => {
  const clientId = '6b58815e509940539428705cce2b1d14';
  // const [accessToken, setAccessToken] = useState<string | undefined | null>();
  const [code, setCode] = useState<string>();
  const [buttonString, setButtonString] = useState('Authorize Spotify Access');

  const storedAccessToken = localStorage.getItem(spotifyAccessTokenKey);
  const expirationDate = localStorage.getItem(spotifyExpiryKey);
  const isStale = new Date() >= new Date(Number(expirationDate) || '');

  useEffect(() => {
    if (storedAccessToken !== null && !isStale) {
      // setAccessToken(storedAccessToken);
      setButtonString('Authorized 👍');
    }
  }, [storedAccessToken, isStale]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramCode = params.get('code');
    if (paramCode !== null) {
      setCode(paramCode);
      const location = window.location;
      const url = new URL(location.href);
      url.searchParams.delete('code');
      history.replaceState(null, 'placeholder', url);
    }
  }, []);

  useEffect(() => {
    if (code) {
      getAccessToken(clientId, code).then((token) => {
        // setAccessToken(token);
        localStorage.setItem(spotifyAccessTokenKey, token);
        props.onAuthenticate?.();
      });
    }
  }, [code]);

  const buttonFn = () => {
    localStorage.removeItem(spotifyExpiryKey);
    localStorage.removeItem(spotifyRefreshTokenKey);
    localStorage.removeItem(spotifyAccessTokenKey);
    getSpotifyAuthorization(clientId);
  };

  if (expirationDate && isStale) {
    setButtonString('Refresh Spotify Access');
    localStorage.removeItem(spotifyExpiryKey);
    localStorage.removeItem(spotifyRefreshTokenKey);
    localStorage.removeItem(spotifyAccessTokenKey);
  }

  return (
    <div className="flex flex-w border-black border-2 p-1 rounded-sm m-2 flex-col justify-center items-center bg-slate-200">
      <button
        className={`rounded w-fit h-fit ${
          // accessToken ? 'bg-slate-400' : 'bg-[#1ed760]'
          'bg-slate-400'
        } text-[#121212] font-bold cursor-not-allowed p-2`}
        // disabled={Boolean(accessToken)}
        disabled={true}
        onClick={buttonFn}
      >
        {buttonString}
      </button>
      <p className="text-sm italic text-gray-800">
        note - while Spotify reviews this app for public use, clicking this
        button won't actually show your songs. I'm hoping to make it generally
        available in the coming days - thanks for your patience!
      </p>
      <p className="text-sm text-gray-800 font-semibold">
        In the meantime, click the button below to see a list of tracks that I
        enjoy.
      </p>
    </div>
  );
};
