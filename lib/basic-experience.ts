export type MembershipAccessState = "checking" | "ready" | "unavailable" | "membership-error" | "redirecting";

export type MembershipAccessSnapshot = {
  requiredPlan: boolean;
  authResolved: boolean;
  hasSupabaseClient: boolean;
  isLoggedIn: boolean;
  planResolved: boolean;
  isMembershipLoading: boolean;
  planError: string | null;
  hasActiveSubscription: boolean;
  hasRequiredAccess: boolean;
  membershipStatus: string | null;
};

export function resolveMembershipAccessState(snapshot: MembershipAccessSnapshot): MembershipAccessState {
  if (!snapshot.requiredPlan) {
    return "ready";
  }

  if (!snapshot.authResolved) {
    return "checking";
  }

  if (!snapshot.hasSupabaseClient) {
    return "unavailable";
  }

  if (!snapshot.isLoggedIn) {
    return "redirecting";
  }

  if (!snapshot.planResolved || snapshot.isMembershipLoading) {
    return "checking";
  }

  if (snapshot.planError) {
    return "membership-error";
  }

  if (!snapshot.hasActiveSubscription || !snapshot.hasRequiredAccess) {
    return "redirecting";
  }

  return "ready";
}

type PlaybackMediaElement = HTMLMediaElement & {
  preservesPitch?: boolean;
  webkitPreservesPitch?: boolean;
  playsInline?: boolean;
};

export function preparePlaybackMediaElement<T extends PlaybackMediaElement>(
  media: T,
  options: {
    volume?: number;
    muted?: boolean;
    loop?: boolean;
    playsInline?: boolean;
    preload?: "none" | "metadata" | "auto";
  } = {}
) {
  media.defaultPlaybackRate = 1;
  media.playbackRate = 1;
  media.preservesPitch = true;
  media.webkitPreservesPitch = true;

  if (options.volume !== undefined) {
    media.volume = options.volume;
  }

  if (options.muted !== undefined) {
    media.defaultMuted = options.muted;
    media.muted = options.muted;
  }

  if (options.loop !== undefined) {
    media.loop = options.loop;
  }

  if (options.playsInline !== undefined) {
    media.playsInline = options.playsInline;
  }

  if (options.preload !== undefined) {
    media.preload = options.preload;
  }

  return media;
}
