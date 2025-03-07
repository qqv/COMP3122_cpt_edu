export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error: any) {
    if (retries === 0 || error.status === 404) throw error
    
    await new Promise(resolve => setTimeout(resolve, delay))
    return withRetry(fn, retries - 1, delay * 2)
  }
} 