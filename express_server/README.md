# express server

- Create appropriate sqlite database folder (e.g. by `path/to/db.sqlite` you
have to touch `./path/to`)
- Run `node server`. This will start a server at `localhost:<port>` where
`port` is specified in the configuration.
- To enable SSL, create a `greenlock` object based on greenlock configuration
parameters. (This is currently under development.)
