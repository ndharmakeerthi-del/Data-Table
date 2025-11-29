import { ROUTES } from './routes.constant';

export const NAV_ITEMS = [
    { label: 'Dashboard', path: ROUTES.HOME },
    { label: 'Products', path: ROUTES.PRODUCTS },
    { label: 'User', path: ROUTES.USER },
] as const;