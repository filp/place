import config from 'config'
import express from 'express'
import multer from 'multer'
import bodyParser from 'body-parser'
import bus from './bus'
import handlers from './handlers'
import logger from './logger'

const port = config.get('server.port')
const app = express()

app.use(multer().none())
app.use(bodyParser.json())

app.post('/hooks/plex', async (req, res) => {
  const payload = JSON.parse(req.body.payload)

  bus.emit(`plex:${payload.event.replace('.', ':')}`, payload)

  res.end()
})

app.get('/state', async (req, res) => {
  res.status(200).json(await handlers.collectState())
})

app.post('/command', async (req, res) => {
  bus.emit(`command:${req.body.command}`, req.body)

  res.status(200).json(await handlers.collectState())
})

app.post('/command/:command', async (req, res) => {
  bus.emit(`command:${req.params.command}`, req.body)

  res.status(200).json(await handlers.collectState())
})

app.listen(port, () => {
  logger.info({ port }, 'home server started')

  bus.emit('work:startup')
})

// Setup work loops:
setInterval(() => {
  bus.emit('work:frequent')
}, 45000)
