import { useEffect, useState } from 'react';
import { getAccessToken, getSpotifyAuthorization } from './spotifyAuth';
import {
  spotifyAccessTokenKey,
  spotifyExpiryKey,
  spotifyRefreshTokenKey,
} from './utils';

export const AuthenticationButton = (props: { onAuthenticate: () => void }) => {
  const clientId = '6b58815e509940539428705cce2b1d14';
  const [accessToken, setAccessToken] = useState<string | undefined | null>();
  const [code, setCode] = useState<string>();
  const [buttonString, setButtonString] = useState('Authorize Spotify Access');

  const storedAccessToken = localStorage.getItem(spotifyAccessTokenKey);
  const expirationDate = localStorage.getItem(spotifyExpiryKey);
  const isStale = new Date() >= new Date(Number(expirationDate) || '');

  useEffect(() => {
    if (storedAccessToken !== null && !isStale) {
      setAccessToken(storedAccessToken);
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
        setAccessToken(token);
        localStorage.setItem(spotifyAccessTokenKey, token);
        props.onAuthenticate();
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
    <button
      className={`rounded w-fit h-fit ${
        accessToken ? 'bg-slate-400' : 'bg-[#1ed760]'
      } text-[#121212] font-bold cursor-pointer p-2`}
      disabled={Boolean(accessToken)}
      onClick={buttonFn}
    >
      {buttonString}
    </button>
  );
};
