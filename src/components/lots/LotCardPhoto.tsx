import { Box, Image, Skeleton } from '@mantine/core';
import { IconCar } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { assetUrl } from '../../lib/format';
import { randomLotPhoto } from '../../state/lots';
import type { Lot } from '../../types';

interface LotCardPhotoProps {
  lot: Lot;
  title: string;
}

const MAX_FALLBACKS = 5;

export function LotCardPhoto({ lot, title }: LotCardPhotoProps) {
  const [src, setSrc] = useState(() => assetUrl(lot.photo));
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const photoRef = useRef(lot.photo);
  const attemptsRef = useRef(0);

  const handleError = () => {
    if (attemptsRef.current >= MAX_FALLBACKS) {
      setFailed(true);
      setLoaded(true);
      return;
    }

    const fallback = randomLotPhoto(photoRef.current);
    if (!fallback || fallback === photoRef.current) {
      setFailed(true);
      setLoaded(true);
      return;
    }

    attemptsRef.current += 1;
    photoRef.current = fallback;
    setSrc(assetUrl(fallback));
    setLoaded(false);
  };

  if (failed) {
    return (
      <Box
        h={180}
        bg="var(--mantine-color-gray-1)"
        display="flex"
        role="img"
        aria-label={`${title}, ${lot.year}`}
        style={{ alignItems: 'center', justifyContent: 'center' }}
      >
        <IconCar size={48} color="var(--mantine-color-gray-5)" />
      </Box>
    );
  }

  return (
    <>
      {!loaded && <Skeleton height={180} radius={0} pos="absolute" inset={0} />}
      <Image
        src={src}
        alt={`${title}, ${lot.year}`}
        height={180}
        fit="cover"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </>
  );
}
