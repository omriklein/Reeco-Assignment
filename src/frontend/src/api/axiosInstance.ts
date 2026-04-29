import axios, { type AxiosError } from 'axios'
import { ApiError } from './errors'

interface ApiErrorBody {
  error: string
  code: string
}

const axiosInstance = axios.create({ baseURL: '/api' })

axiosInstance.interceptors.response.use(
  (res) => res,
  (err: AxiosError<ApiErrorBody>) => {
    const message = err.response?.data?.error ?? err.message ?? 'Unknown error'
    const code = err.response?.data?.code ?? 'UNKNOWN'
    const status = err.response?.status ?? 0
    throw new ApiError(message, code, status)
  },
)

export default axiosInstance