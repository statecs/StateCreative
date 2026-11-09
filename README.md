# State Creative

Source for [statecreative.se](https://statecreative.se/), the website of State Creative, an independent Swedish studio for design, user experience, web development and consulting, founded in 2011.

It's a static, single-page site: plain HTML, CSS and JavaScript with no framework. Smooth scrolling comes from [Lenis](https://github.com/darkroomengineering/lenis).

## Structure

```
index.html            Single-page site (markup, SEO meta, structured data)
assets/css/style.css  Styles
assets/js/site.js     Animated emblem and interactions
assets/js/vendor/     Third-party scripts (Lenis)
assets/img/brand/     Favicons, logos, Open Graph image
logo-new/             Logo source files (not deployed)
llms.txt              Site summary for LLMs
robots.txt, sitemap.xml, site.webmanifest
scripts/build.js      Copies the deployable files into build/
release.js            Uploads build/ to the server over SFTP
```

## Development

Requires Node.js and Python 3.

```sh
npm install
npm start          # serves the site at http://localhost:8000
```

## Build and deploy

```sh
npm run build      # writes the live files to build/
npm run release    # builds, then uploads build/ over SFTP
```

`release` reads the server details from a local `.env` file, which is gitignored. Copy `env.example.txt` to `.env` and fill in:

```
SFTP_HOST=
SFTP_PORT=
SFTP_USERNAME=
SFTP_PASSWORD=
REMOTE_DIR=
```

If you add a new file that the site needs, add it to the `files` list in `scripts/build.js` too.

## License

© State Creative. All rights reserved. The code is public to read, but the State Creative name, logos and brand assets may not be reused.
