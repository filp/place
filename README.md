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
- Flexible rule system (see `config/default.example.yml`, or the example below) around the above mentioned events

## Example rule configuration

```yaml
rules:
  - name: theater-on-stop
    description: Turn on the lights in the living room when pausing or stopping something on the chromecast/plex
    triggers:
      - theater:media:stop
      - theater:media:pause
    conditions:
      time:
        from: { hour: 19, minute: 0 }
        to: { hour: 23, minute: 59 }
    actions:
      - run: command:hue:group:state
        name: Living Room Ambient
        state: true
```

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

## Enabling and disabling modules

Modules can be enabled or disabled based on the existence of a key in the top level of the configuration file
with the module's name.

For example, to enable the rules module, simply add a `rules` key to the configuration yaml file:

```yaml
rules: []
```

The above will enable the rules module (though since the list is empty, no actual rules will be configured).
