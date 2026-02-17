import type { SVGProps } from 'react';

export type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const defaultIconProps: IconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function iconProps(props: IconProps) {
  const { size, ...rest } = props;
  return {
    ...defaultIconProps,
    ...(size ? { width: size, height: size } : {}),
    ...rest,
  };
}
