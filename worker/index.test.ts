import { describe, it, expect } from 'vitest'
import worker from './index'

describe('Worker', () => {
  it('should return health check response', async () => {
    const request = new Request('http://localhost/api/health')

    const response = await worker.fetch(request)
    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('status', 'ok')
    expect(data).toHaveProperty('timestamp')
  })

  it('should handle CORS preflight', async () => {
    const request = new Request('http://localhost/api/health', {
      method: 'OPTIONS',
    })

    const response = await worker.fetch(request)
    expect(response.status).toBe(200)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })

  it('should return 404 for unknown routes', async () => {
    const request = new Request('http://localhost/unknown')

    const response = await worker.fetch(request)
    expect(response.status).toBe(404)
  })
})
