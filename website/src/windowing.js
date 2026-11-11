const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
export function fitRect(rect, bounds) {
  const width = Math.max(1, Math.min(rect.width, bounds.width - 16));
  const height = Math.max(1, Math.min(rect.height, bounds.height - 16));
  return { x: clamp(rect.x, 8, Math.max(8, bounds.width - width - 8)), y: clamp(rect.y, 8, Math.max(8, bounds.height - height - 8)), width, height };
}
export function initialRect(id, bounds) {
  if (id === 'readme') return fitRect({ x: 16, y: 316, width: 146, height: 204 }, bounds);
  const x = Math.min(240, Math.max(168, bounds.width * 0.165));
  return fitRect({ x, y: 48, width: Math.min(1170, bounds.width - x - 28), height: Math.min(1438, bounds.height - 96) }, bounds);
}
export function createWindows(bounds) {
  return { active: 'projects', projects: { mode: 'normal', restoreMode: 'normal', rect: initialRect('projects', bounds) }, readme: { mode: 'normal', restoreMode: 'normal', rect: initialRect('readme', bounds) } };
}
export function windowReducer(state, action) {
  const item = state[action.id];
  switch (action.type) {
    case 'open': return { ...state, active: action.id, [action.id]: { ...item, mode: item.mode === 'minimized' ? item.restoreMode : item.mode === 'closed' ? 'normal' : item.mode } };
    case 'focus': return state.active === action.id ? state : { ...state, active: action.id };
    case 'minimize': return { ...state, active: null, [action.id]: { ...item, restoreMode: item.mode, mode: 'minimized' } };
    case 'close': return { ...state, active: null, [action.id]: { ...item, mode: 'closed' } };
    case 'maximize': return { ...state, active: action.id, [action.id]: { ...item, mode: item.mode === 'maximized' ? 'normal' : 'maximized' } };
    case 'move': return item.mode !== 'normal' ? state : { ...state, [action.id]: { ...item, rect: fitRect({ ...item.rect, x: action.x, y: action.y }, action.bounds) } };
    case 'resize': return { ...state, projects: { ...state.projects, rect: initialRect('projects', action.bounds) }, readme: { ...state.readme, rect: fitRect(state.readme.rect, action.bounds) } };
    case 'reset': return createWindows(action.bounds);
    default: return state;
  }
}
