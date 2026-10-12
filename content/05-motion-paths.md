---
title: Motion Paths
chapter: "05"
section: Motion Paths
tags: [After Effects, Motion Paths, Auto-Orient, Speed]
read_time: 4
outcomes:
  - Draw a curved motion path
  - Make a shape look where it goes
  - Give it an even speed
---

04 was about *when*. Now it's about *where*: Position keyframes leave a trail, the motion path. Shape it, and your ball rides the loop.

## Create Paths

Every Position keyframe is a point on the path. The handles between them shape the curve.

:::step Rough it in
Set a few Position keyframes. Don't worry about the curve yet.
:::

:::step Shape the path
Pull the handles with the Convert Vertex tool, it sits under the Pen tool: press G until it shows. Move the points with the Selection tool.
![Three keyframes with a hard corner. The Convert Vertex tool drags handles out of the middle keyframe and the corner turns into a curve, then the Selection tool moves the keyframe](demo:path-shape)
:::

## Orient Along Path

The ball should look where it's going, also upside down at the top of the loop.

:::step Auto-Orient
Right-click the layer and turn on Orient Along Path.
`Transform > Auto-Orient > Orient Along Path`
:::

:::step Fix the rotation
Set the Rotation once so the ball's line points forward. Don't animate it.
:::

:::tip
`ball` spinning around the wrong point? Madness. Check its anchor point. Imported with Retain Layer Sizes (02), it sits in the middle of the ball.
:::

## Even Speed

Uneven spacing between keyframes makes the speed jump. Rove Across Time evens it out.

:::step Rove Across Time
Select all Position keyframes except the first and the last. Right-click and choose Rove Across Time.
![The ball rides the loop. Switch Rove Across Time off and the frame dots on the path spread apart and bunch up: the speed jumps](demo:ball-loop/rove)
:::

:::step Ease in and out
Select the first and the last keyframe and set them to Easy Ease.
`F9`
:::

:::step Shape the speed
Open the Graph Editor and adjust the speed graph. Pull the handles until the start and the end feel right.
`Shift+F3`
:::

:::exercise A ball through the loop
starter: continue 02
result: demo:ball-loop

1. Open the `loop` comp from 02.
2. Select `ball`. Set as many Position keyframes as you like: from the left, once around the loop, out to the right. Uneven spacing is fine.
3. Shape the path with the Convert Vertex tool so the ball stays on the inner edge of the loop.
4. Turn on Orient Along Path and fix the Rotation.
5. Set Rove Across Time on the middle keyframes and Easy Ease on the first and the last one.
6. Adjust the speed graph in the Graph Editor.
7. Preview: the ball stays on the track, starts and stops softly and keeps an even speed in between.
:::

:::shortcuts
| Action | Mac | Windows |
|---|---|---|
| Pen tool | `G` | `G` |
| Auto-Orient | `⌥⌘O` | `Ctrl+Alt+O` |
| Easy Ease | `F9` | `F9` |
| Graph Editor | `Shift+F3` | `Shift+F3` |
:::

:::more
- [Speed](https://helpx.adobe.com/after-effects/desktop/animate-in-after-effects/speed-between-keyframes/speed.html) – Adobe After Effects Help
- [Assorted animation tools](https://helpx.adobe.com/after-effects/desktop/animate-in-after-effects/assorted-animation-tools/assorted-animation-tools.html) – Adobe After Effects Help
:::
