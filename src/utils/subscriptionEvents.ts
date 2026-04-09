type BlockedCallback = (errorCode: string, message: string) => void;
type UnavailableCallback = (message: string) => void;

let blockedCallback: BlockedCallback | null = null;
let unavailableCallback: UnavailableCallback | null = null;

export function onSubscriptionBlocked(cb: BlockedCallback): () => void {
  blockedCallback = cb;
  return () => { blockedCallback = null; };
}

export function onSubscriptionUnavailable(cb: UnavailableCallback): () => void {
  unavailableCallback = cb;
  return () => { unavailableCallback = null; };
}

export function fireSubscriptionBlocked(errorCode: string, message: string): void {
  blockedCallback?.(errorCode, message);
}

export function fireSubscriptionUnavailable(message: string): void {
  unavailableCallback?.(message);
}
