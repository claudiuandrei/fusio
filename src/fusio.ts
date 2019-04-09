// @flow
import { reference, task, batch, chain, error } from './update'
import createDispatch from './dispatcher'
import { enhanceReducer, createMiddleware } from './redux'

// Export the two of them
export {
  // Helpers
  reference,
  task,
  batch,
  chain,
  error,
  // Create a dispatch
  createDispatch,
  // Create middleware
  createMiddleware,
  // Wrap reducers
  enhanceReducer
}
