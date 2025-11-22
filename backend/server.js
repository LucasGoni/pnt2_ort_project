import express from 'express'
import cors from 'cors'
import RouterAuth from './router/auth.js'

class Server {
    #port = null
    #app = null
    #routerAuth = null

    constructor(port) {
        this.#port = port
        this.#app = express()
        this.#routerAuth = new RouterAuth().config()
        this.#config()
    }

    #config() {
        this.#app.use(cors())
        this.#app.use(express.json())
        this.#app.use(express.urlencoded({ extended: true }))
        this.#app.use(express.static('public'))

        this.#app.get('/health', (req, res) => {
            res.json({
                status: 'UP',
                timestamp: new Date().toISOString()
            })
        })

        this.#app.use('/api/auth', this.#routerAuth)
    }

    start() {
        this.#app.listen(this.#port, () => {
            console.log(`Servidor corriendo en http://localhost:${this.#port}`)
        })
    }
}

export default Server
