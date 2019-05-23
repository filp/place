# place

Home automation platform.

## Rationale

I built `place` because while there are many projects with the same goals - most offering much wider
compatibility and flexibility - I found them cumbersome to maintain, overengineered in some ways, and
primarily just not fun to work with.

`place` is supposed to be fun for me to work on, and that'll continue to be the main goal.

## Can I run place on my own home?

Probably, but right now it makes some heavy assumptions of what your home looks like. If you're trying
to use it and running into a problem, open an issue and let me know. At this point I'm making no effort
to accomodate other users besides myself.

## Features

- Plex support
- Chromecast support
- Hue lights support
- Pihole support
- Network discovery-based presence detection, including enter/exit detection
- Extensive events you can hook into to automate various features
- Flexible rule system (see `config/default.example.yml`) around the above mentioned events

## Setup

`place` can run on any computer running nodejs, including a raspberry pi:

```shell
# You must have nodejs installed
$ node -v

# Copy and modify the example configuration file
$ cp config/{default.example.yml,default.yml}
$ (vi|nano) config/default.yml

# Install project dependencies
$ npm i

# Start place with the development logger
$ npm start

# Build place and run it from the distribution build (recommended if running as a daemon, for example)
$ npm run build
$ node dist/index.js
```
