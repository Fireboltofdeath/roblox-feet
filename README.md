# Roblox Feet

<sup>name pending, made for personal use, use at own risk</sup>

A command line tool to manage feature-based organization for your Rojo project.

You can generate a feature anywhere in your project and it will contain a `server` folder, a `client` folder and, optionally, a `shared` folder. This allows you to organize code based off individual features (or another arbitrary unit) without having to manually generate the Rojo paths necessary. You can also generate server-only and client-only features which will not have multiple folders for server, client and shared.

![](https://i.imgur.com/42DWuIE.png)

### Usage

```
feet add feature/my-feature
feet add -sh feature/my-feature-with-shared
feet add -s feature/my-server-only-feature
feet add -c feature/my-client-only-feature
feet add feature/my/nested/feature

feet remove feature/my-feature
feet remove --preserve feature/my-feature
```

### Drawbacks

This requires modifying the Rojo project which a lot of tooling does not support when actively running (including Rojo itself.)
