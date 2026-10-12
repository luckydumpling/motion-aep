---
title: Tips
chapter: "07"
section: Tips
tags: [After Effects, Tips, Keyframes, Footage]
read_time: 4
outcomes:
  - Speed up or slow down an animation in one move
  - Swap footage without losing the animation
  - Animate X and Y separately
---

Three small tricks that save you bare time.

## Scale Keyframes

Make an animation faster or slower without moving every keyframe.

:::step Select all keyframes
Select every keyframe of the animation you want to change.
:::

:::step Alt-drag the end
Alt-drag the first or last keyframe. All keyframes scale together.
![Holding Alt and dragging the last keyframe: all keyframes move closer together](demo:scale-keyframes)
:::

## Replace Footage

Swap what a layer shows and keep all its animation.

:::step One layer
Select the layer in the Timeline. Alt-drag the new item from the Project panel onto it.

In class: select `bg` and Alt-drag `loop.psd` from `footage > psd` onto it. The new background keeps the layer's position, timing and animation.
![Layer 3 is selected, then Blue is Alt-dragged from the Project panel onto it: only layer 3 turns blue](demo:replace-footage/one)
:::

:::step All layers
In the Project panel, Alt-drag one item onto another. Every layer using it gets replaced.
![Blue is Alt-dragged onto Orange in the Project panel: all Orange layers turn blue](demo:replace-footage/all)
:::

## Separate Dimensions

Animate X and Y Position independently, for example with different timing.

:::step Separate them
Right-click Position and choose Separate Dimensions.
`Separate Dimensions`
![Ctrl-clicking Position and choosing Separate Dimensions: X and Y Position appear](demo:separate-dimensions)
:::

:::exercise Faster, swapped, separated
starter: continue 04

1. Open `motion_design_basics_04_keyframes`. Alt-drag the last keyframe of `LINEAR` to make it twice as fast.
2. Create two solids, `Blue` and `Orange`.
3. Put `Orange` three times into a new comp `motion_design_basics_07_tips`.
4. Replace one layer: Alt-drag `Blue` onto it in the Timeline.
5. Replace all of them: Alt-drag `Blue` onto `Orange` in the Project panel.
6. On a new square, separate the dimensions and animate X and Y with different timing.
:::

:::shortcuts
| Action | Mac | Windows |
|---|---|---|
| New Solid | `⌘Y` | `Ctrl+Y` |
:::

:::more
- [Editing, moving and copying keyframes](https://helpx.adobe.com/after-effects/desktop/animate-in-after-effects/animation-keyframes/editing-moving-copying-keyframes.html) – Adobe After Effects Help
- [Quick Tipps](https://dasnorm.ch/AE/einfuehrung/quick-tipps/) – dasnorm.ch
:::
