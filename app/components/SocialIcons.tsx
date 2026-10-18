import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function Github({ size = 20, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-1.99 1.03-2.69-.1-.26-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03A9.56 9.56 0 0 1 12 6.97c.85 0 1.7.11 2.5.34 1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.39.1 2.65.64.7 1.03 1.59 1.03 2.69 0 3.85-2.34 4.69-4.57 4.94.36.31.68.92.68 1.86v2.59c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" /></svg>;
}

export function Linkedin({ size = 20, ...props }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}><path d="M20.45 2H3.55C2.7 2 2 2.67 2 3.5v17c0 .83.7 1.5 1.55 1.5h16.9c.86 0 1.55-.67 1.55-1.5v-17c0-.83-.69-1.5-1.55-1.5ZM8 19H5V9h3v10ZM6.5 7.7a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5ZM19 19h-3v-5.2c0-1.24-.02-2.84-1.73-2.84-1.74 0-2 1.36-2 2.75V19h-3V9h2.88v1.37h.04A3.16 3.16 0 0 1 15.04 8.8c3.04 0 3.96 2 3.96 4.59V19Z" /></svg>;
}
