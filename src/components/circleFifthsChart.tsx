import { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { default as meyda } from 'meyda';
import {
  noteAngles,
  noteNames,
  octaves,
  processAmplitudeSpectrum,
  Song,
} from './utils';
import { MeydaAnalyzer } from 'meyda/dist/esm/meyda-wa';

export const CircleFifthsChart = (props: {
  previewUrl?: string;
  song?: Song;
  width?: number;
  height?: number;
}) => {
  const baseColor = '#002233';
  const { song, previewUrl, width = 400, height = 600 } = props;
  const constrainingDimension = Math.min(width, height / 2);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode>(null);
  const analyzerRef = useRef<MeydaAnalyzer>(null);

  const [keyOctaveAmplitudes, setKeyOctaveAmplitudes] = useState<{
    [keyString: string]: number;
  }>({});
  const [chroma, setChroma] = useState<Array<number>>([]);
  const [playing, setPlaying] = useState(false);
  const [hover, setHover] = useState(false);
  const [maxZcr, setMaxZcr] = useState<number>();
  const [strongestNoteCoords, setStrongestNoteCoords] = useState([
    [width / 2, height / 2],
  ]);

  const amplitudeScale = d3
    .scaleLinear()
    .domain([0, 10000])
    .range([1, constrainingDimension / 10]);

  amplitudeScale.clamp();

  useEffect(() => {
    if (playing) {
      if (previewUrl) {
        const audioElement = audioRef.current as HTMLAudioElement;

        if (!audioElement) {
          return;
        }
        // Initialize the AudioContext only once
        if (!audioContextRef.current) {
          // @ts-expect-error yes we can assign to current!
          audioContextRef.current = new AudioContext();
        }

        const audioContext = audioContextRef.current as AudioContext;

        if (audioSourceRef.current == null) {
          // @ts-expect-error yes we can assign to current!
          audioSourceRef.current =
            audioContext.createMediaElementSource(audioElement);
          audioSourceRef.current.connect(audioContext.destination);
        }

        // Initialize Meyda analyzer
        // @ts-expect-error yes we can assign to current!
        analyzerRef.current = meyda.createMeydaAnalyzer({
          audioContext,
          source: audioSourceRef.current,
          bufferSize: 2048,
          featureExtractors: ['chroma', 'powerSpectrum', 'zcr'],
          callback: (results: {
            amplitudeSpectrum: number[];
            powerSpectrum: number[];
            chroma: number[];
            perceptualSpread: number;
            zcr: number;
          }) => {
            const { chroma, powerSpectrum, zcr } = results;
            setKeyOctaveAmplitudes(
              processAmplitudeSpectrum(powerSpectrum, audioContext),
            );
            setChroma(chroma);
            if (!maxZcr) {
              setMaxZcr(zcr);
            } else {
              if (zcr / maxZcr <= 1.5) {
                setMaxZcr(zcr);
                const maxChroma = Math.max(...chroma);
                // Determine the strongest note by finding the max chroma value index
                const strongestIndex = chroma.indexOf(maxChroma);
                if (strongestIndex !== -1 && maxChroma > 0.3) {
                  console.log({ zcr, strongestIndex, chroma });
                  const angle =
                    ((noteAngles[noteNames[strongestIndex]] - 90) / 360) *
                    2 *
                    Math.PI;
                  const x = Math.cos(angle) * radius * 6;
                  const y = Math.sin(angle) * radius * 6;
                  setStrongestNoteCoords((prior) => [
                    [x + width / 2, y + height / 2.5 + 124],
                    ...prior,
                  ]);
                }
              }
            }
          },
        });

        analyzerRef.current.start();
      }
    }
  }, [previewUrl, playing]);
  useEffect(() => {
    setStrongestNoteCoords([[width / 2, height / 2]]);
  }, [previewUrl]);
  const radius = constrainingDimension / 16;
  return (
    <div className="w-fit flex flex-col gap-2">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <audio
          ref={audioRef}
          crossOrigin="anonymous"
          src={previewUrl}
          loop
          autoPlay={playing}
          controls
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          style={{
            width: `${width}px`,
          }}
        />
      </div>
      {keyOctaveAmplitudes && (
        <svg
          width={width}
          height={height}
          overflow="hidden"
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
          onClick={() => {
            if (playing) {
              setPlaying(false);
              audioRef.current?.pause();
            } else {
              setPlaying(true);
              audioRef.current?.play();
            }
          }}
        >
          <defs>
            <filter id="softGlow" height="300%" width="300%" x="-75%" y="-75%">
              <feMorphology
                operator="dilate"
                radius="2"
                in="SourceAlpha"
                result="thicken"
              />

              <feGaussianBlur in="thicken" stdDeviation="7" result="blurred" />

              <feFlood floodColor="rgb(250,250,155)" result="glowColor" />

              <feComposite
                in="glowColor"
                in2="blurred"
                operator="in"
                result="softGlow_colored"
              />

              <feMerge>
                <feMergeNode in="softGlow_colored" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect x={0} y={0} width={width} height={height} fill={baseColor} />
          {song && (
            <text x={15} y={32} fill="white" fontWeight={800}>
              {song?.name} - {song?.artists[0].name}
            </text>
          )}
          {/* <path
            d={`M${width / 2},${height / 2.5} ${strongestNoteCoords.map(
              (point) => `L${point[0]},${point[1]}`,
            )}Z`}
            stroke="white"
            strokeWidth="5"
            fill="none"
            strokeOpacity={0.4}
            strokeLinecap="round"
            style={{ transition: 'd 0.5s ease' }}
          /> */}
          {/* note labels */}
          {Object.entries(noteAngles).map(([note, degrees], index) => {
            const angle = ((degrees - 90) / 360) * 2 * Math.PI;
            const x = Math.cos(angle) * radius * 6;
            const y = Math.sin(angle) * radius * 6;
            const value = chroma[index];
            return (
              <text
                key={note}
                x={x}
                y={y}
                dy="0.3em"
                transform={`translate(${width / 2}, ${height / 2.5 + 124})`}
                textAnchor="middle"
                fill={baseColor}
                opacity={playing && value > 0.75 ? value / 1.5 : 0.1}
                fontFamily="arial"
                fontWeight="800"
                filter={'url(#softGlow)'}
              >
                {note}
              </text>
            );
          })}
          {octaves.map((octave, octaveIndex) => {
            const translateValue = `${width / 2}, ${
              height / 2.5 + octaveIndex * 25 - 75
            }`;
            const probablyPercussion = octave > 6;
            const noteNameValues = Object.values(noteNames);
            return (
              <g key={octave}>
                {noteNameValues.map((note, index) => {
                  const degrees = noteAngles[note] - 90;
                  const angle = (degrees / 360) * 2 * Math.PI;
                  const x = Math.cos(angle) * (radius * 6);
                  const y = Math.sin(angle) * (radius * 6);

                  const amplitude =
                    keyOctaveAmplitudes[`${note}${octave}`] || 0;

                  const color = d3.hsl(degrees, 0.7, 0.5);
                  const rotateValue = noteAngles[note];

                  if (probablyPercussion) {
                    return (
                      <line
                        key={note + octave}
                        x1={x - amplitude / 10}
                        x2={x + amplitude / 10}
                        y1={y}
                        y2={y}
                        strokeWidth={2}
                        opacity={0.6}
                        stroke="white"
                        transform={`
                                translate(${translateValue})
                                rotate(${rotateValue} ${x} ${y})
                              `}
                      />
                    );
                  } else if (chroma[index] > 0.4)
                    return (
                      <rect
                        key={note + octave}
                        x={x - Math.min(amplitudeScale(amplitude), 50)}
                        y={y}
                        width={Math.min(amplitudeScale(amplitude) * 2, 100)}
                        height={2 * (10 - octave)}
                        fill={color.toString()}
                        opacity={0.9}
                        rx={Math.min(4, amplitudeScale(amplitude) / 2)}
                        transform={`
                                translate(${translateValue})
                                rotate(${rotateValue} ${x} ${y})
                              `}
                      />
                      // </g>
                    );
                })}
              </g>
            );
          })}
          {hover && (
            <g transform={`translate(${width / 2}, ${height / 2})`}>
              <circle cx={0} cy={0} r={40} fill="white" fillOpacity={0.3} />
              {playing ? (
                <g>
                  <rect x={-20} y={-20} height={40} width={15} fill="white" />
                  <rect x={5} y={-20} height={40} width={15} fill="white" />
                </g>
              ) : (
                <polygon
                  transform="translate(-15, -30)"
                  points="0,0 45,30 0,60"
                  fill="white"
                />
              )}
            </g>
          )}
          <g
            transform={`
            translate (${width - 50}, ${height - 280})
            scale (0.075)
            `}
          >
            <path
              fill="#1ed760"
              d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8Z"
            />
            <path d="M406.6 231.1c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3zm-31 76.2c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm-26.9 65.6c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4z" />
          </g>
        </svg>
      )}
      {song && (
        <a
          href={song?.spotify_url}
          target="_blank"
          className="text-sm italic text-gray-400"
        >
          <p>{`See "${song.name}" by ${song.artists[0].name} on Spotify`}</p>
        </a>
      )}
    </div>
  );
};
