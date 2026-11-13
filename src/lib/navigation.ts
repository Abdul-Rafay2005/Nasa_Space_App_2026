/**
 * Aegis Health — Client-side Hash Router
 * Compliant with PLAN.md Section 3.1 & Section 10
 */

export type AppRoute =
  | 'monitor'
  | 'trends'
  | 'body'
  | 'check-in'
  | 'alerts'
  | 'history'
  | 'routine'
  | 'overview'
  | 'sources';

// Mapping between legacy page IDs and route keys
const routeAliases: Record<string, AppRoute> = {
  dashboard: 'monitor',
  monitor: 'monitor',
  analytics: 'trends',
  trends: 'trends',
  'body-map': 'body',
  body: 'body',
  assessment: 'check-in',
  'check-in': 'check-in',
  guidance: 'alerts',
  alerts: 'alerts',
  history: 'history',
  routine: 'routine',
  overview: 'overview',
  sources: 'sources',
  settings: 'sources',
};

export function getCurrentRoute(): AppRoute {
  const hash = window.location.hash.replace(/^#\/?/, '').split('?')[0].toLowerCase();
  return routeAliases[hash] || 'monitor';
}

export function navigateTo(route: AppRoute | string): void {
  const target = routeAliases[route] || 'monitor';
  window.location.hash = `#/${target}`;
}

export function subscribeToRoute(callback: (route: AppRoute) => void): () => void {
  const handler = () => callback(getCurrentRoute());
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}
