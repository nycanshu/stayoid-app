import { createContext, useContext } from 'react';

/**
 * Lets nested overlays (date pickers, action sheets, etc.) know they're being
 * opened from inside a Modal-backed sheet (FormSheet) and route through that
 * sheet's PortalHost instead of stacking another native Modal.
 *
 * iOS only renders one transparent Modal at a time — nested Modals silently
 * swallow each other. Portal-based rendering side-steps that.
 */
export interface OverlayHost {
  /** PortalHost name to target. Undefined → render to default (root) host. */
  hostName?: string;
}

export const OverlayHostContext = createContext<OverlayHost>({});

export function useOverlayHost(): OverlayHost {
  return useContext(OverlayHostContext);
}
