import express from 'express'
import alumnosRouter from './router/alumnos.js'

class Server {
    #port = null
    #app = null

    constructor(port) {
        // Garantizamos TZ del curso
        process.env.TZ = 'America/Argentina/Buenos_Aires'
        this.#port = port
        this.#app = express()
        this.#config()
    }

    #config() {
        this.#app.use(express.json())
        this.#app.use(express.urlencoded({ extended: true }))
        this.#app.use(express.static('public'))

        this.#app.use('/api/alumnos', alumnosRouter)

        this.#app.get('/health', (req, res) => {
            res.json({
                status: 'UP',
                timestamp: new Date().toISOString()
            })
        })

    }

    start() {
        this.#app.listen(this.#port, () => {
            console.log(`Servidor corriendo en http://localhost:${this.#port}`)
        })
    }
}

export default Server
