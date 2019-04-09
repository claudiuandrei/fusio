import createDispatch from './dispatcher'

// Types
import { State, Update, Action, Reducer, Store, Dispatch } from './types'

// Replace
const REPLACE = '@REPLACE'

// Reducer
export const enhanceReducer = (baseReducer: Reducer<State>) => (
  state: State,
  action: Action
): State => {
  switch (action.type) {
    case REPLACE:
      return action.payload
    default:
      return baseReducer(state, action)
  }
}

// Creating the middleware
export const createMiddleware = (getUpdate: (key: string) => Update | undefined) => (
  store: Store
) => (next: Dispatch) => {
  // Create a dispatch for processing the data
  const dispatch = createDispatch(store.getState, state => next({ type: REPLACE, payload: state }))

  // Load the data
  return (action: Action): any => {
    // Check if we have an update
    const update = getUpdate(action.type)

    // Process the update
    return update ? dispatch(update, action.payload) : next(action)
  }
}
