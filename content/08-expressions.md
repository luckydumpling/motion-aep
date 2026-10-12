---
title: "Expressions: Time, Wiggle, Loop"
chapter: "08"
section: Expressions
tags: [After Effects, Expressions, Wiggle, Loop]
read_time: 4
outcomes:
  - Add an expression to a property
  - Move layers without keyframes
  - Loop keyframes forever
---

Expressions are tiny bits of code on a property. Three of them cover most micro motion.

## Time

`time` is the current time in seconds. Multiply it and the value keeps growing.

:::step Open the expression
Alt-click the stopwatch of a property, for example Rotation.
:::

:::step Type it
The layer turns 90° per second. Change the number to change the speed.
`time*90`
![A square turns 90° per second. Change the number to change the speed.](demo:expression/time)
:::

## Wiggle

`wiggle` shakes a value randomly.

:::step Type it
On Position: 2 is how often per second, 50 is how far in pixels.
`wiggle(2, 50)`
![A circle wiggles 2 times per second, up to 50 pixels. Change the numbers to see the difference.](demo:expression/wiggle)
:::

## Loop

`loopOut` repeats your keyframes after the last one.

:::step Set the keyframes
Animate the property once, for example a short pulse on Scale.
:::

:::step Type it
Alt-click the stopwatch and add the loop.
`loopOut("cycle")`
![A Scale pulse of three keyframes repeats with loopOut. Switch it off and the pulse plays only once.](demo:expression/loop)
:::

:::tip
Expression turns red? No stress, check spelling and brackets. After Effects is strict.
:::

:::exercise Three shapes, three expressions
starter: none
result: demo:expression/all

1. Create a comp `motion_design_basics_08_expressions` and draw three small shapes side by side.
2. Shape 1: add `time*90` to Rotation.
3. Shape 2: add `wiggle(2, 50)` to Position.
4. Shape 3: set Scale to 100%, 3 frames later 50%, 3 frames later 100%.
5. Shape 3: add `loopOut("cycle")` to Scale.
6. Preview.
:::

:::shortcuts
| Action | Mac | Windows |
|---|---|---|
| Add expression | `⌥`-click stopwatch | `Alt`-click stopwatch |
:::

:::more
- [Expression basics](https://helpx.adobe.com/after-effects/desktop/work-with-expressions/expression-basics/expression-basics.html) – Adobe After Effects Help
- [Expression examples](https://helpx.adobe.com/after-effects/desktop/work-with-expressions/expression-examples/expression-examples.html) – Adobe After Effects Help
- [Expressions](https://dasnorm.ch/AE/einfuehrung/expression/) – dasnorm.ch
:::
