export function createLimiter(max: number) {
  let active = 0
  const queue: Array<() => void> = []

  const next = () => {
    if (active >= max) return
    const run = queue.shift()
    if (run) {
      active++
      run()
    }
  }

  return function limit<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      queue.push(() => {
        task()
          .then(resolve, reject)
          .finally(() => {
            active--
            next()
          })
      })
      next()
    })
  }
}
