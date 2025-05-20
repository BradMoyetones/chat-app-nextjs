import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // ✅ Enviará y recibirá cookies httpOnly automáticamente
})

api.interceptors.request.use(config => {
    const refreshToken = Cookies.get('refreshToken') // ✅ No es httpOnly, se puede leer

    if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken
    }

    return config
})

export default api
