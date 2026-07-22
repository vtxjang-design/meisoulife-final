# BASIC Japanese Narration Audit

This document tracks the current Japanese narration foundation for BASIC Gates so pronunciation, pause timing, and voice direction can be reviewed without changing protected recovery logic blindly.

## Voice Categories

1. Morning grounding
   Calm, clear, lightly awakening. Suitable for `Awakening Gate`, `Energy Gate`, and `Vision Gate`.
2. Daytime reset
   Gentle but present. Suitable for `Focus Gate` and `Calm Gate`.
3. Evening release
   Slower, warmer, and more spacious. Suitable for `Release Gate`, `Gratitude Gate`, and `Sleep Gate`.

## Review Status Key

- `needs-review`: wording or pronunciation should be checked with native listening review
- `tuned`: line already includes kana-friendly `speechText` or timing adjustment

## Daytime Gates

| Gate | Key | On-screen copy | Spoken copy | Pronunciation / reading note | Delay | Voice | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Focus | `focus-1` | 鼻から、静かに息を入れます。 | 鼻から、静かに、息を入れます。 | Short pause after `静かに` | 420ms | Daytime reset | tuned |
| Focus | `focus-2` | ゆっくり、吐きます | ゆっくり、吐きます | Keep one relaxed exhale phrase | 640ms | Daytime reset | needs-review |
| Focus | `focus-3` | すべてを、今すぐ考えなくても大丈夫です | すべてを、いま すぐ かんがえなくても だいじょうぶです | Clarify `今すぐ` and soften `大丈夫` landing | 700ms | Daytime reset | tuned |
| Focus | `focus-4` | 今は、ひとつだけに意識を戻してみます | いまは、ひとつだけに いしきを もどしてみます | Keep `意識` from flattening | 720ms | Daytime reset | tuned |
| Focus | `focus-5` | その静けさのまま、戻りましょう | その しずけさのまま、もどりましょう | Protect `静けさ` softness | 760ms | Daytime reset | tuned |
| Calm | `calm-1` | 体の力を静かに下ろします | 体の力を、静かに下ろします | Avoid clipped `体` opening | 560ms | Daytime reset | tuned |
| Calm | `calm-2` | ゆっくり息を吸います | ゆっくり、息を吸います | Gentle comma timing | 640ms | Daytime reset | tuned |
| Calm | `calm-3` | 長く吐きます | 長く、吐きます | Keep `長く` airy, not emphatic | 700ms | Daytime reset | tuned |
| Calm | `calm-4` | 吐くたびに緊張が少しずつほどけていきます | 吐くたびに、緊張が少しずつ、ほどけていきます | Natural break before `ほどけて` | 700ms | Daytime reset | tuned |
| Calm | `calm-5` | 肩も表情もやわらいでいきます | 肩も、表情も、やわらいでいきます | Keep even pacing | 720ms | Daytime reset | tuned |
| Calm | `calm-6` | 今この瞬間をそのまま感じます | 今この瞬間を、そのまま感じます | Protect `今この瞬間` meaning block | 700ms | Daytime reset | tuned |
| Calm | `calm-7` | 何もしなくても大丈夫です | 何もしなくても、大丈夫です | Soften `大丈夫` ending | 760ms | Daytime reset | tuned |
| Calm | `calm-8` | このやわらかさとともに一日へ戻ります | このやわらかさとともに、一日へ戻ります | Keep final return line light | 760ms | Daytime reset | tuned |

## Evening Gates

| Gate | Key | On-screen copy | Spoken copy | Pronunciation / reading note | Delay | Voice | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Release | `release-2` | 今は、少し休んでも大丈夫です | いまは、すこし やすんでも だいじょうぶです | Avoid dragging `大丈夫` on older iOS voices | 920ms | Evening release | tuned |
| Release | `release-3` | 今日という 一日は、いろいろな時間があったことでしょう | きょうという いちにちは、いろいろな じかんが あったことでしょう | Keep `今日という一日` connected | 940ms | Evening release | tuned |
| Release | `release-7` | 今日終わらなかったことは、明日のあなたに任せても大丈夫です | きょう おわらなかったことは、あしたの あなたに まかせても だいじょうぶです | Long line; candidate for future shortening | 1020ms | Evening release | needs-review |
| Gratitude | `gratitude-2` | 今日は、少しだけ一日を思い返してみます | きょうは、すこしだけ いちにちを おもいかえしてみます | Keep `思い返して` distinct | 980ms | Evening release | tuned |
| Gratitude | `gratitude-13` | 今日も頑張ってくれた自分自身 | きょうも がんばってくれた じぶんじしん | Warm self-address; avoid sharp stress | 1180ms | Evening release | tuned |
| Sleep | `sleep-1` | 今日も...お疲れさまでした | 今日も...お疲れさまでした | Opening line should feel complete on its own | 1040ms | Evening release | needs-review |
| Sleep | `sleep-2` | もう...何もしなくて大丈夫です | もう...なにもしなくて だいじょうぶです | Reduce pace drift on older Safari voices | 1080ms | Evening release | tuned |
| Sleep | `sleep-3` | 呼吸は...そのままで大丈夫です | こきゅうは...そのままで だいじょうぶです | Keep breath cue gentle, not directive | 1080ms | Evening release | tuned |
| Sleep | `sleep-4` | 今は...何もしなくて大丈夫です | いまは...なにも しなくて だいじょうぶです | Final permission line; leave silence after this | 1100ms | Evening release | tuned |

## Evening TTS Stabilization Pass (Pre-recording)

This pass does not replace the Japanese voice actor. It stabilizes browser `speechSynthesis` until approved recorded narration is available.

| Gate | Displayed text | Old spoken text | Proposed spoken text | Pronunciation / pause intention | Native review |
| --- | --- | --- | --- | --- | --- |
| Release | 今は、少し休んでも大丈夫です | いまは、すこし やすんでも だいじょうぶです | いまは、少し休んでも大丈夫です。 | Remove unnatural spacing and let the landing fall gently | needs-review |
| Release | 今日という 一日は、いろいろな時間があったことでしょう | きょうという いちにちは、いろいろな じかんが あったことでしょう | きょうという いちにちは、いろいろな時間があったことでしょう。 | Keep `一日` as `いちにち` and keep the phrase connected | needs-review |
| Release | 今日終わらなかったことは、明日のあなたに任せても大丈夫です | きょう おわらなかったことは、あしたの あなたに まかせても だいじょうぶです | きょう終わらなかったことは、明日のあなたに、任せても大丈夫です。 | One soft pause before `任せても` instead of word-by-word spacing | needs-review |
| Gratitude | 今日は、少しだけ一日を思い返してみます | きょうは、すこしだけ いちにちを おもいかえしてみます | きょうは、少しだけ、いちにちを思い返してみます。 | Keep it reflective, not explanatory | needs-review |
| Gratitude | 近すぎて、気づかなかったあたたかさがあったかもしれません | 近すぎて、気づかなかった あたたかさが あったかもしれません | 近すぎて、気づかなかった あたたかさが、あったかもしれません。 | Small pause before the closing clause | needs-review |
| Gratitude | 今日も頑張ってくれた自分自身 | きょうも がんばってくれた じぶんじしん | きょうも、頑張ってくれた 自分自身。 | Warm self-compassion line with a softer opening breath | needs-review |
| Sleep | 今日も...お疲れさまでした | 今日も...お疲れさまでした | 今日も…お疲れさまでした。 | Let the acknowledgement feel complete on its own | needs-review |
| Sleep | 呼吸は...そのままで大丈夫です | こきゅうは...そのままで だいじょうぶです | 呼吸は…そのままで大丈夫です。 | Brief non-commanding breath cue | needs-review |
| Sleep | もう...何もしなくて大丈夫です | もう...なにもしなくて だいじょうぶです | もう…何もしなくて大丈夫です。 | Final permission line; no narration after this | needs-review |

### Selected Short-term JP Evening TTS Settings

- Release: `rate 0.80`, `pitch 0.88`, `volume 0.84`
- Gratitude: `rate 0.80`, `pitch 0.90`, `volume 0.82`
- Sleep: `rate 0.76`, `pitch 0.84`, `volume 0.78`

These values were chosen to avoid the stretched feel of the previous `0.60–0.66` range on older iOS engines while keeping the tone calm and grounded.

## Morning Gates

| Gate | Key | On-screen copy | Spoken copy | Pronunciation / reading note | Delay | Voice | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Awakening | `open-2` | 今日も新しい朝が訪れました | 今日も、新しい朝が、訪れました | Gentle phrase breaks keep the line cinematic | 460ms | Morning grounding | tuned |
| Awakening | `affirm-1` | 呼吸とともに身体が少しずつ目覚めていきます | 呼吸とともに、身体が少しずつ、目覚めていきます | Keep `身体` warm, not clinical | 460ms | Morning grounding | tuned |
| Energy | `open-2` | 今日は体の中心から目覚めます | 今日は、体の中心から目覚めます | Protect first `今日は` vowel | 420ms | Morning grounding | tuned |
| Energy | `open-5` | 丹田に意識を向けます | 丹田に、意識を向けます | `丹田` needs consistent reading guidance in studio review | 500ms | Morning grounding | needs-review |
| Vision | `open-2` | 少しだけ呼吸に戻ります | 少しだけ、呼吸に戻ります | Soft comma before `呼吸` | 480ms | Morning grounding | tuned |
| Vision | `vision-5` | 今ここにあるのはこの瞬間です | 今、ここにあるのは、この瞬間です | Keep `この瞬間` centered | 560ms | Morning grounding | tuned |

## Next Listening Pass

1. Compare iPhone 8 Safari and recent iPhone Safari for `Release`, `Gratitude`, and `Sleep`.
2. Re-listen to long Japanese lines with `speechText` and confirm they are still natural after rate changes.
3. Decide whether `Focus` and `Calm` should share one Japanese voice or split by tone.
