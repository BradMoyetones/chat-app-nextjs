import axios from 'axios'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true, // ✅ para enviar/recibir cookies httpOnly
})

// 👉 Interceptor para manejar respuestas 401 y renovar token
api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config

        const isAuthRoute = originalRequest.url?.includes('/api/auth/login') ||
                            originalRequest.url?.includes('/api/auth/register') ||
                            originalRequest.url?.includes('/api/auth/verify-email') ||
                            originalRequest.url?.includes('/api/auth/resend-verify-email')

        // Evita loop + ignora errores de rutas de auth
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url !== '/api/auth/refresh' &&
            !isAuthRoute
        ) {
            originalRequest._retry = true

            try {
                await api.post('/api/auth/refresh')
                return api(originalRequest)
            } catch (refreshError) {
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api
