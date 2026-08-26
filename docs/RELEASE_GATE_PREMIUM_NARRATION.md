# Release Gate Premium Narration Standard

Release Gate is the reference piece for upgrading BASIC narration from functional browser guidance to a calm, premium listening experience.

## Experience Direction

- The voice is a quiet companion, not a teacher or authority.
- The listener is given permission rather than instructed to perform.
- Eight cues replace the previous eleven so silence carries more of the experience.
- Japanese is the master performance language. Korean and English preserve the same intention and timing rather than translating word for word.
- The final cue begins at 162 seconds, leaving about 17 seconds of quiet before the three-minute session ends.

## Aligned Script

| Time | Japanese master | Korean | English | Performance intention |
| --- | --- | --- | --- | --- |
| 0:12 | 今日も一日、お疲れさまでした。 | 오늘도 하루를 잘 지나오셨습니다. | You have made it through another day. | Acknowledge without evaluating the day. |
| 0:30 | ここからは、何かを終わらせなくても、大丈夫です。 | 이제는 무언가를 끝내지 않아도 괜찮습니다. | From here, nothing else needs to be finished. | Permission; no urgency. |
| 0:52 | 今日あったことを、ひとつずつ片づけなくていい。そんな時間です。 | 오늘 있었던 일을 하나씩 정리하지 않아도 되는 그런 시간입니다. | This is a time when the day does not need to be sorted out. | Two phrases with a full breath between them. |
| 1:16 | 肩の力がゆるむのを、ただ、感じてみます。 | 어깨의 힘이 풀리는 것을 그저 느껴봅니다. | Simply notice your shoulders softening. | Invitation, never a command. |
| 1:38 | 呼吸は、そのままで、大丈夫です。 | 호흡은 그대로여도 괜찮습니다. | Your breath can remain just as it is. | Do not prescribe deeper breathing. |
| 2:00 | 今日、終わらなかったことは、明日に預けておきましょう。 | 오늘 끝나지 않은 일은 내일에 맡겨두어도 좋습니다. | What remains unfinished today can be left for tomorrow. | Warm downward cadence. |
| 2:24 | 今は、ただ静かに、ここにいます。 | 지금은 그저 조용히 여기에 머뭅니다. | For now, simply be here in the quiet. | Nearly whispered, but still clear. |
| 2:42 | 今日の重さを、ここに、そっと置いていきます。 | 오늘의 무게를 이곳에 가만히 내려놓습니다. | Set down the weight of today here. | Final line; no narration afterward. |

## Japanese Voice Direction

- Native Japanese speaker, warm lower-mid register, adult voice without theatrical breathiness.
- Conversational standard Japanese; avoid a ceremonial, anime, advertisement, or therapeutic-authority tone.
- Target tempo: roughly 0.9 times natural conversation, with phrasing created by breath rather than stretched syllables.
- Leave 0.5–0.8 seconds at commas, 1.2–1.8 seconds between clauses, and the full remaining quiet after the final line.
- Let sentence endings fall naturally. Do not over-emphasize `大丈夫です` or `おきましょう`.
- Record dry at 48 kHz / 24-bit WAV. Keep peaks below -6 dBFS and provide an unprocessed master plus a lightly mastered delivery file.

## Current Technical State

The application still uses browser `speechSynthesis` as a compatibility fallback. The revised script and pacing improve that fallback, but browser voices remain device-dependent. A fixed recorded Japanese narration asset is required for the final premium release. When that approved asset exists, it should become the primary track and browser TTS should remain only as an explicit fallback.
