// 禁用 punycode 警告
process.removeAllListeners('warning')
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && 
      warning.message.includes('punycode')) {
    return
  }
  console.warn(warning)
}) 