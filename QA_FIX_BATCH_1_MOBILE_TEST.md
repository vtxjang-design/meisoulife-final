# QA Fix Batch 1 Mobile Test

Target branch: `qa-fix-batch-1-from-latest-main`

Primary local base URL:
- `http://localhost:3000`

Production-like routes to test:
- Login: `http://localhost:3000/login`
- Update password: `http://localhost:3000/auth/update-password`
- Home / FREE 1-Minute Reset: `http://localhost:3000/`
- 7-Day Recovery Journey: `http://localhost:3000/rhythm-journey`
- BASIC daily rhythm: `http://localhost:3000/program/basic`
- Meditation player: `http://localhost:3000/meditation`

Suggested test environment:
- Device: iPhone Safari
- Viewport: iPhone 13/14/15 width
- Audio: ringer on, media volume up
- Network: normal mobile/Wi-Fi

## 1. Password Reset Email Flow

Route:
- `http://localhost:3000/login`

Checklist:
- [ ] Tap `Forgot password` from the login screen.
- [ ] Enter a valid account email and submit reset request.
- [ ] Confirm success message appears after request.
- [ ] Confirm reset email arrives on mobile mail client.
- [ ] Open the reset email on iPhone and tap the recovery link.
- [ ] Confirm the link opens the app recovery flow, not a dead-end screen.
- [ ] Confirm the link lands on `auth/update-password` flow through auth callback handling.
- [ ] Set a new password successfully.
- [ ] After password update, confirm user can continue into the intended next route, defaulting to `/program/basic` when no valid next path exists.

## 2. FREE 1-Minute Reset Fullscreen/Open Button

Route:
- `http://localhost:3000/`
- Scroll to FREE `1-Minute Reset`

Checklist:
- [ ] Open each reset from the list on iPhone Safari.
- [ ] Confirm the primary open/fullscreen action responds on first tap.
- [ ] Confirm the experience enters playback cleanly without requiring desktop-only behavior.
- [ ] Confirm video is visible and playable in mobile Safari.
- [ ] Confirm there is no dead tap, blocked button, or frozen overlay.

## 3. FREE 1-Minute Reset Return Button

Route:
- `http://localhost:3000/`
- Start any 1-minute reset

Checklist:
- [ ] Confirm `戻る / Back to 1-Minute Resets` is visible during playback.
- [ ] Tap the return button while the reset is playing.
- [ ] Confirm video stops immediately.
- [ ] Confirm audio stops immediately.
- [ ] Confirm the timer stops and does not continue in background.
- [ ] Confirm the screen returns to the 1-minute reset option list.
- [ ] Start another reset after returning and confirm playback starts fresh.

## 4. FREE 1-Minute Reset Removed Unnecessary Block

Route:
- `http://localhost:3000/`
- Scroll to FREE `1-Minute Reset`

Checklist:
- [ ] Confirm the section feels focused on immediate recovery only.
- [ ] Confirm the previously unnecessary extra content block is no longer shown under or around the reset experience.
- [ ] Confirm no replacement block adds distraction or dashboard feeling.

## 5. Brain Flexibility CTA

Route:
- `http://localhost:3000/`
- Scroll to Brain Flexibility / Brain Ownership journey section

Checklist:
- [ ] Confirm the lower `Try Experience` button is removed.
- [ ] Confirm the replacement CTA label is `メンバーとして始める`.
- [ ] Tap the CTA while logged out and confirm it routes into the login/member start flow.
- [ ] Tap the CTA while logged in with free access and confirm it routes into the BASIC membership start/payment path.
- [ ] Confirm the CTA does not point to the removed free try flow.

## 6. 7-Day Recovery Day Selector / Reset

Route:
- `http://localhost:3000/rhythm-journey`

Checklist:
- [ ] Confirm a calm day selector or reset control is visible.
- [ ] Move directly from Day 1 to another day without completing each day in sequence.
- [ ] Move from a later day back to Day 1.
- [ ] Switch between multiple days and confirm the content updates correctly each time.
- [ ] Start a day meditation and return back to the journey.
- [ ] Confirm returning after completion preserves a coherent route and does not trap the user.
- [ ] Confirm the control feels minimal and not gamified.

## 7. BASIC Morning Gate Narration / Music

Routes:
- `http://localhost:3000/meditation?duration=180&type=morning&door=affirmation`
- `http://localhost:3000/meditation?duration=180&type=morning&door=energy`
- `http://localhost:3000/meditation?duration=180&type=morning&door=vision`

Checklist:
- [ ] Open each Morning Gate route on iPhone Safari.
- [ ] Confirm audio does not try to autoplay before user interaction in a broken way.
- [ ] Perform the required user interaction to begin playback.
- [ ] Confirm narration voice plays after start.
- [ ] Confirm background music/ambient audio plays after start where applicable.
- [ ] Pause and resume if available, and confirm narration/music behavior remains stable.
- [ ] Confirm there is no silent failure after pressing the start/enter action.

## 8. BASIC Morning Gate Nature Toggle Removed

Routes:
- `http://localhost:3000/meditation?duration=180&type=morning&door=affirmation`
- `http://localhost:3000/meditation?duration=180&type=morning&door=energy`
- `http://localhost:3000/meditation?duration=180&type=morning&door=vision`

Checklist:
- [ ] Confirm `Nature On/Off` or equivalent nature sound toggle is not shown in Morning Gate.
- [ ] Confirm removing the toggle does not break the layout.
- [ ] Confirm there is no empty gap or visual artifact where the toggle used to be.

## 9. BASIC Morning Gate 3:00 Timer

Routes:
- `http://localhost:3000/meditation?duration=180&type=morning&door=affirmation`
- `http://localhost:3000/meditation?duration=180&type=morning&door=energy`
- `http://localhost:3000/meditation?duration=180&type=morning&door=vision`

Checklist:
- [ ] Confirm the timer displays `3:00` at entry.
- [ ] Confirm the timer starts when the practice actually starts.
- [ ] Confirm the timer counts down once per second.
- [ ] Confirm the timer does not continue before user start on mobile.
- [ ] Pause the practice if available and confirm the timer stops.
- [ ] Resume the practice and confirm the timer continues correctly.
- [ ] Exit the practice and re-enter it.
- [ ] Confirm the timer resets cleanly to `3:00`.
- [ ] Complete the practice and confirm the timer reaches the completion state cleanly.

## Quick Regression Pass

Checklist:
- [ ] No overlapping text on iPhone width.
- [ ] No broken taps or double-tap-only controls.
- [ ] No stuck audio after leaving a screen.
- [ ] No unexpected desktop-style hover dependency.
- [ ] Each scoped route still feels calm, simple, and recovery-focused.
