import config from '../../config.js'
import UsuariosMem from './usuariosMem.js'

class UsuariosFactory {
    static get(tipo) {
        switch (tipo) {
            case 'MEM':
                return new UsuariosMem()
            case 'SQLITE':
                return new UsuariosMem()
            default:
                return new UsuariosMem()
        }
    }
}

export default UsuariosFactory
