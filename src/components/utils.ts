enum NoteName {
  'C' = 'C',
  'C#' = 'C#',
  'D' = 'D',
  'D#' = 'D#',
  'E' = 'E',
  'F' = 'F',
  'F#' = 'F#',
  'G' = 'G',
  'G#' = 'G#',
  'A' = 'A',
  'A#' = 'A#',
  'B' = 'B',
}

export const noteNames: { [key: number]: NoteName } = {
  0: NoteName.C,
  1: NoteName['C#'],
  2: NoteName.D,
  3: NoteName['D#'],
  4: NoteName.E,
  5: NoteName.F,
  6: NoteName['F#'],
  7: NoteName.G,
  8: NoteName['G#'],
  9: NoteName.A,
  10: NoteName['A#'],
  11: NoteName.B,
};
export const noteAngles: { [key in NoteName]: number } = {
  [NoteName.C]: 0,
  [NoteName['C#']]: 210,
  [NoteName.D]: 60,
  [NoteName['D#']]: 270,
  [NoteName.E]: 120,
  [NoteName.F]: 330,
  [NoteName['F#']]: 180,
  [NoteName.G]: 30,
  [NoteName['G#']]: 240,
  [NoteName.A]: 90,
  [NoteName['A#']]: 300,
  [NoteName.B]: 150,
};
export const NOTE_FREQUENCIES: { [key in NoteName]: number } = {
  [NoteName.C]: 16.35,
  [NoteName.D]: 18.35,
  [NoteName.E]: 20.6,
  [NoteName.F]: 21.83,
  [NoteName.G]: 24.5,
  [NoteName.A]: 27.5,
  [NoteName.B]: 30.87,
  [NoteName['C#']]: 17.32,
  [NoteName['D#']]: 19.45,
  [NoteName['F#']]: 23.12,
  [NoteName['G#']]: 25.96,
  [NoteName['A#']]: 29.14,
};

export const NOTES = Object.keys(NOTE_FREQUENCIES);

export interface NoteInfo {
  note: string;
  octave: number;
  cents: number;
}

export const octaves = [0, 1, 2, 3, 4, 5, 6, 7].sort((a, b) => b - a);

export const frequencyToNote = (frequency: number): NoteInfo => {
  // Find the base frequency (C0) and calculate how many semitones above it our frequency is
  const baseFreq = NOTE_FREQUENCIES[NoteName.C];
  const semitones = 12 * Math.log2(frequency / baseFreq);

  // Calculate the octave and the note within that octave
  const octave = Math.floor(semitones / 12);
  const noteIndex = Math.round(semitones % 12);

  // Get the actual note name
  const note = noteNames[noteIndex];

  // Calculate cents (how far off from the exact note frequency we are)
  const exactFrequency =
    NOTE_FREQUENCIES[note as unknown as keyof typeof NOTE_FREQUENCIES] *
    Math.pow(2, octave);
  const cents = Math.round(1200 * Math.log2(frequency / exactFrequency));

  return { note, octave, cents };
};

export const processAmplitudeSpectrum = (
  amplitudeSpectrum: number[],
  audioContext: AudioContext,
) => {
  const sampleRate = audioContext.sampleRate;
  const binSize = sampleRate / (2 * amplitudeSpectrum.length);

  const keyOctaveAmps: { [key: string]: number } = {};

  amplitudeSpectrum.forEach((amplitude, index) => {
    const frequency = index * binSize;

    // Only process frequencies within the range of musical instruments
    if (frequency >= 20 && frequency <= 20000) {
      const { note, octave, cents } = frequencyToNote(frequency);
      const key = `${note}${octave}`;

      // Only consider amplitudes above a certain threshold to reduce noise
      if (amplitude > 0.01) {
        if (!keyOctaveAmps[key]) {
          keyOctaveAmps[key] = 0;
        }
        // Weight the amplitude based on how close it is to the exact note frequency
        const weight = 1 - Math.abs(cents) / 50; // 50 cents = quarter tone
        keyOctaveAmps[key] += amplitude * weight;
      }
    }
  });

  return keyOctaveAmps;
};

export const spotifyAccessTokenKey = 'af-spotifyAccessToken';
export const spotifyExpiryKey = 'af-spotifyExpiryTime';
export const spotifyRefreshTokenKey = 'af-spotifyRefreshToken';
