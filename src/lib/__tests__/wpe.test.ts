import { describe, it, expect } from 'vitest'

describe('wp-content-exporter integration', () => {
  it('package is installed and available', () => {
    // Verify the package is installed as a dependency
    const pkg = require.resolve('wp-content-exporter')
    expect(pkg).toBeDefined()
  })
})


