import type { AvatarSize } from './types';

/** Diameter per size, shared by Avatar, AvatarGroup and UserInfo. */
export const AVATAR_SIZES: Record<AvatarSize, string> = {
	sm: 'var(--ren-space-xl)',
	md: 'var(--ren-space-2xl)',
	lg: 'var(--ren-space-3xl)',
	xl: 'var(--ren-space-4xl)'
};
