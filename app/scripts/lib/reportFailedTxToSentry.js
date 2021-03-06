const ethJsRpcSlug = 'Error: [ethjs-rpc] rpc error with payload '
const errorLabelPrefix = 'Error: '

module.exports = reportFailedTxToSentry

//
// utility for formatting failed transaction messages
// for sending to sentry
//

function reportFailedTxToSentry({ raven, txMeta }) {
  const errorMessage = extractErrorMessage(txMeta.err.message)
  raven.captureMessage(errorMessage, {
    // "extra" key is required by Sentry
    extra: txMeta,
  })
}

//
// ethjs-rpc provides overly verbose error messages
// if we detect this type of message, we extract the important part
// Below is an example input and output
//
// Error: [ethjs-rpc] rpc error with payload {"id":3947817945380,"jsonrpc":"2.0","params":["0xf8eb8208708477359400830398539406012c8cf97bead5deae237070f9587f8e7a266d80b8843d7d3f5a0000000000000000000000000000000000000000000000000000000000081d1a000000000000000000000000000000000000000000000000001ff973cafa800000000000000000000000000000000000000000000000000000038d7ea4c68000000000000000000000000000000000000000000000000000000000000003f48025a04c32a9b630e0d9e7ff361562d850c86b7a884908135956a7e4a336fa0300d19ca06830776423f25218e8d19b267161db526e66895567147015b1f3fc47aef9a3c7"],"method":"eth_sendRawTransaction"} Error: replacement transaction underpriced
//
// Transaction Failed: replacement transaction underpriced
//

function extractErrorMessage(errorMessage) {
  const isEthjsRpcError = errorMessage.includes(ethJsRpcSlug)
  if (isEthjsRpcError) {
    const payloadAndError = errorMessage.slice(ethJsRpcSlug.length)
    const originalError = payloadAndError.slice(payloadAndError.indexOf(errorLabelPrefix) + errorLabelPrefix.length)
    return `Transaction Failed: ${originalError}`
  } else {
    return `Transaction Failed: ${errorMessage}`
  }
}
