---
title: Keyframes, Types + Curves
chapter: "04"
section: Keyframes
tags: [After Effects, Keyframes, Easing, Graph Editor]
read_time: 6
outcomes:
  - Set keyframes on any property
  - Choose between linear, Easy Ease and hold
  - Shape speed in the Graph Editor
---

Keyframes are where motion starts. Two values at two moments, After Effects does the rest.

## Set Keyframes

A keyframe stores a value at a moment in time. After Effects fills in the frames between keyframes.

:::step Start the stopwatch
Click the stopwatch next to a property. This sets the first keyframe.
:::

:::step Move and change
Move the playhead and change the value. A new keyframe appears automatically.
:::

:::warning
Click the stopwatch again and all your keyframes are gone. Don't panic, undo brings them back.
`⌘Z / Ctrl+Z`
:::

:::step Preview
Press Space to play your animation.
`Space`
:::

## Keyframe Types

The type of a keyframe decides how the motion feels:

- **Linear** – constant speed, mechanical
- **Easy Ease** – slow out, slow in, feels natural
- **Hold** – jumps to the next value, great for blinking

:::demo keyframe-types
Three squares with the same keyframes move right and back: Linear at constant speed, Easy Ease slowing out and in, Hold jumping.
:::

:::step Easy Ease
Select the keyframes, right-click and choose Keyframe Assistant > Easy Ease.
`F9`
:::

:::step Hold
Select the keyframes, right-click and choose Toggle Hold Keyframe.
:::

:::step Back to linear
⌘-click (Windows: Ctrl-click) a keyframe to switch it to linear.
![One Easy Ease keyframe is Cmd-clicked (Windows: Ctrl-clicked) and turns into a linear keyframe](demo:keyframe-click)
:::

## Curves

The Graph Editor shows how your animation moves over time. The speed graph shows how fast a value changes, the value graph shows the value itself. Most of the time you work with the speed graph.

:::step Open the Graph Editor
Select the keyframes and switch the Timeline to the Graph Editor.
`Shift+F3`
:::

:::step Shape the curve
Drag the handles. The higher the curve, the faster the motion.
![Speed graph with two handles: drag them and the square's motion changes](demo:speed-graph)
:::

:::tip
Previews too slow? Set the work area with B and N, only that part gets previewed.
:::

:::exercise Three squares, three keyframe types
starter: none
result: demo:keyframe-types

1. Create a comp `motion_design_basics_04_keyframes`: 1920×1080, Square Pixels, 25 fps, 10 seconds.
2. Draw a 150×150 px square.
3. Set Position keyframes at 1 s and 3 s. At 2 s, move the square to the right.
4. Duplicate the layer twice, move the copies down and rename them `LINEAR`, `EASY EASE` and `HOLD`.
5. `EASY EASE`: Easy Ease. `HOLD`: Toggle Hold Keyframe.
6. Preview and compare.
7. Open `EASY EASE` in the Graph Editor and change its speed curve.
:::

:::shortcuts
| Action | Mac | Windows |
|---|---|---|
| Preview | `Space` | `Space` |
| Easy Ease | `F9` | `F9` |
| Graph Editor | `Shift+F3` | `Shift+F3` |
| Previous / next keyframe | `J` / `K` | `J` / `K` |
| Work area start / end | `B` / `N` | `B` / `N` |
:::

:::more
- [Keyframe interpolation](https://helpx.adobe.com/after-effects/desktop/animate-in-after-effects/animation-keyframes/keyframe-interpolation.html) – Adobe After Effects Help
- [Speed graph reference](https://youtu.be/jzCVD9zA-ZM) – YouTube
:::
