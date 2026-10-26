import { useEffect, useState } from 'react';

export function useWebGLCapability(): boolean {
  const [supported, setSupported] = useState<boolean>(false);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
      setSupported(Boolean(gl) && cores >= 2);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
