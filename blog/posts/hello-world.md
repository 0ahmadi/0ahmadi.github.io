---
title: Hello, Blog
date: 2026-08-11
tags: [meta, notes]
---

This is my first post. Here's how the building blocks work.

## Inline and block math

Inline math like $E = mc^2$ or $x_i \sim \mathcal{N}(0, \sigma^2)$ works fine.

Block math too:

$$
\frac{\partial \mathcal{L}}{\partial w} = \sum_{i=1}^{n} (\hat{y}_i - y_i) x_i
$$

## Code

```python
def leaky_integrate_and_fire(v, i, tau=10.0, dt=1.0):
    dv = (-v + i) / tau
    return v + dv * dt
```

## Images


## Tables and quotes

| Model | Accuracy |
|---|---|
| Baseline | 71% |
| MobileNetV3 | 84% |

> A note or a quote can go here too.
