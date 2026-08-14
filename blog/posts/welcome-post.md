This is the first post on this blog. It's written in plain Markdown, and this page
supports code blocks, images, and LaTeX math out of the box.

## Code blocks

Fenced code blocks are syntax-highlighted automatically:

```python
def fibonacci(n: int) -> int:
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

print(fibonacci(10))  # 55
```

## Math

Inline math like $E = mc^2$ works, and so does display math:

$$
\frac{d}{dx}\left(\int_{a}^{x} f(t)\, dt\right) = f(x)
$$

## Images

To add an image, put the file under `assets/blog/` and reference it with a path
relative to the site root, for example:

```markdown
![Alt text](assets/blog/example.png)
```

That's it — this post itself is just a Markdown file at
`blog/posts/welcome-post.md`, listed in `blog/posts/index.json`.
