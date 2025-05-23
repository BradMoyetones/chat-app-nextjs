import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // ✅ para enviar/recibir cookies httpOnly
})

// 👉 Interceptor para adjuntar el refreshToken (NO httpOnly)
api.interceptors.request.use(config => {
    const refreshToken = Cookies.get('refreshToken')

    if (refreshToken) {
        config.headers['x-refresh-token'] = refreshToken
    }

    return config
})

// 👉 Interceptor para manejar respuestas 401 y renovar token
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config

        // Evita el loop si el error viene de /refresh
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/api/auth/refresh'
        ) {
            originalRequest._retry = true

            try {
                await api.post('/api/auth/refresh') // Usa el header como ya lo haces

                // Reintenta la solicitud original
                return api(originalRequest)
            } catch (refreshError) {
                // Redirige al login u otra acción
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api
