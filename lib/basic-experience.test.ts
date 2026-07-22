import assert from "node:assert/strict";
import test from "node:test";
import { preparePlaybackMediaElement, resolveMembershipAccessState } from "./basic-experience.ts";

test("resolveMembershipAccessState returns ready immediately for already-resolved protected access", () => {
  assert.equal(
    resolveMembershipAccessState({
      requiredPlan: true,
      authResolved: true,
      hasSupabaseClient: true,
      isLoggedIn: true,
      planResolved: true,
      isMembershipLoading: false,
      planError: null,
      hasActiveSubscription: true,
      hasRequiredAccess: true,
      membershipStatus: "active"
    }),
    "ready"
  );
});

test("resolveMembershipAccessState keeps checking only while membership is truly unresolved", () => {
  assert.equal(
    resolveMembershipAccessState({
      requiredPlan: true,
      authResolved: true,
      hasSupabaseClient: true,
      isLoggedIn: true,
      planResolved: false,
      isMembershipLoading: true,
      planError: null,
      hasActiveSubscription: false,
      hasRequiredAccess: false,
      membershipStatus: null
    }),
    "checking"
  );
});

test("preparePlaybackMediaElement resets playback rate and pitch preservation", () => {
  const media = {
    defaultPlaybackRate: 0.5,
    playbackRate: 0.5,
    preservesPitch: false,
    webkitPreservesPitch: false,
    defaultMuted: true,
    muted: true,
    volume: 0.9,
    loop: false,
    playsInline: false,
    preload: "none"
  } as HTMLMediaElement & {
    preservesPitch?: boolean;
    webkitPreservesPitch?: boolean;
  };

  preparePlaybackMediaElement(media, {
    volume: 0.18,
    muted: false,
    loop: true,
    playsInline: true,
    preload: "auto"
  });

  assert.equal(media.defaultPlaybackRate, 1);
  assert.equal(media.playbackRate, 1);
  assert.equal(media.preservesPitch, true);
  assert.equal(media.webkitPreservesPitch, true);
  assert.equal(media.defaultMuted, false);
  assert.equal(media.muted, false);
  assert.equal(media.volume, 0.18);
  assert.equal(media.loop, true);
  assert.equal(media.playsInline, true);
  assert.equal(media.preload, "auto");
});
