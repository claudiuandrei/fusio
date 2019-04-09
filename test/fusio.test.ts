import {
  reference,
  task,
  chain,
  batch,
  error,
  enhanceReducer,
  createMiddleware,
  createDispatch
} from '../src/fusio'

import {
  State,
  Context,
  Change,
  Update,
  Command,
  Action,
  Reducer,
  Dispatch,
  Store,
  Middleware
} from '../src/types'

// Mock a store
const createStore = (
  currentReducer: Reducer<State>,
  initialState: State = {},
  currentMiddleware?: Middleware
) => {
  // Setup the state
  let currentState = initialState

  // Get the state
  const getState = (): State => currentState

  // Dispatch
  const dispatch = (action: Action): any => {
    // Set the new state
    currentState = currentReducer(currentState, action)

    // Return the action
    return action
  }

  // Return the store
  return currentMiddleware
    ? { getState, dispatch: currentMiddleware({ getState, dispatch })(dispatch) }
    : { getState, dispatch }
}

// Create a dispatcher
const create = (
  initialState: State = {}
): [() => State, (update: Update, context?: Context) => Promise<Context>] => {
  // Setup the data
  let data = initialState

  // Setup the reader
  const getState = () => data
  const setState = (state: State) => {
    data = state
  }

  // Create a wrapper
  const dispatch = createDispatch(getState, setState)

  // Load the data
  return [getState, dispatch]
}

// Create the actions
const CREATE_PLAYER = (state: State, context: Context = {}) =>
  reference({ ...state, name: 'John Doe' }, { ...context, age: 25 })

const UPDATE_PLAYER = (state: State, context: Context = {}) =>
  reference({ ...state, name: 'Jane Doe' }, { ...context, age: 23 })

const SPORTS_TEAM = (state: State, context: Context = {}) =>
  reference({ ...state, city: 'San Francisco' }, { ...context, winning: true })

// Task
const BIRTHDAY_TASK = task((input: Context) => Promise.resolve({ ...input, age: input.age + 1 }))
const FAILED_BIRTHDAY_TASK = task((input: Context) => Promise.resolve({ age: 'Unknown' }))

// Chain
const CHAIN_REFERENCE = chain(UPDATE_PLAYER)(CREATE_PLAYER)
const CHAIN_TASK = chain(BIRTHDAY_TASK)(UPDATE_PLAYER)

// Error
const ERROR = chain(undefined, FAILED_BIRTHDAY_TASK)(error(CREATE_PLAYER))

// Batch
const BATCH_REFERENCE = batch([CREATE_PLAYER, UPDATE_PLAYER])
const BATCH_REPLACE = batch([CHAIN_TASK, SPORTS_TEAM])
const BATCH_COMPOSE = batch([CHAIN_REFERENCE, CHAIN_TASK, SPORTS_TEAM])
const BATCH_OF_BATCH = batch([BATCH_COMPOSE, BATCH_REFERENCE, FAILED_BIRTHDAY_TASK])

// Convert
describe('Fusio(n) Reactor', () => {
  test('Reference should update the context and state', () => {
    const [data, dispatch] = create()

    // Load the dispatch value
    return dispatch(CREATE_PLAYER, { context: true }).then(context => {
      // Context
      expect(context).toEqual({
        age: 25,
        context: true
      })

      // State
      expect(data()).toEqual({ name: 'John Doe' })
    })
  })

  test('Tasks should update the context', () => {
    const [data, dispatch] = create()

    // Load the dispatch value
    return dispatch(BIRTHDAY_TASK, { age: 23, passed: true }).then(context => {
      // Context
      expect(context).toEqual({
        age: 24,
        passed: true
      })

      // State
      expect(data()).toEqual({})
    })
  })

  test('Chains should update the context and state in sequence', () => {
    const [data, dispatch] = create()

    // Load the dispatch value
    return dispatch(CHAIN_TASK).then(context => {
      // Context
      expect(context).toEqual({
        age: 24
      })

      // State
      expect(data()).toEqual({ name: 'Jane Doe' })
    })
  })

  test('Chains should update the context and state in sequence even when synchronous', () => {
    const [data, dispatch] = create()

    // Load the dispatch value
    return dispatch(CHAIN_REFERENCE).then(context => {
      // Context
      expect(context).toEqual({
        age: 23
      })

      // State
      expect(data()).toEqual({ name: 'Jane Doe' })
    })
  })

  test('Chains should handle an error', () => {
    const [data, dispatch] = create()

    // Load the dispatch value
    return dispatch(ERROR, { passed: false }).then(context => {
      // Context
      expect(context).toEqual({
        age: 'Unknown'
      })

      // State
      expect(data()).toEqual({
        name: 'John Doe'
      })
    })
  })

  test('Batches merge context and state', () => {
    const [data, dispatch] = create()

    // Load the dispatch value
    return dispatch(BATCH_REPLACE).then(context => {
      // Context
      expect(context).toEqual({
        age: 24,
        winning: true
      })

      // State
      expect(data()).toEqual({
        name: 'Jane Doe',
        city: 'San Francisco'
      })
    })
  })

  test('Batches merge contexts and state even when synchronous', () => {
    const [data, dispatch] = create()

    // Load the dispatch value
    return dispatch(BATCH_REFERENCE, { age: 27 }).then(context => {
      // Context
      expect(context).toEqual({
        age: 23
      })

      // State
      expect(data()).toEqual({
        name: 'Jane Doe'
      })
    })
  })

  test('Batches should take nested batches and merge contexts and state', () => {
    const [data, dispatch] = create()

    // Load the dispatch value
    return dispatch(BATCH_OF_BATCH).then(context => {
      // Context
      expect(context).toEqual({
        age: 'Unknown',
        winning: true
      })

      // State
      expect(data()).toEqual({
        name: 'Jane Doe',
        city: 'San Francisco'
      })
    })
  })
})

// Convert
describe('Redux', () => {
  // Mock a reducer
  const reducer = enhanceReducer((state: State, action: Action) => state)

  // Map
  const map: { [key: string]: Update } = {
    CREATE_PLAYER,
    UPDATE_PLAYER
  }

  // Create middleware
  const middleware = createMiddleware((key: string) => map[key])

  test('Reducer should be able to replace the action', () => {
    // Load the store
    const store = createStore(reducer, { test: true }, middleware)

    // Load the dispatch value
    store.dispatch({ type: 'CREATE_PLAYER', payload: null })

    // State
    expect(store.getState()).toEqual({
      name: 'John Doe',
      test: true
    })
  })

  test('Reducer should be just pass on unrecognized actions', () => {
    // Load the store
    const store = createStore(reducer, { test: true }, middleware)

    // Load the dispatch value
    store.dispatch({ type: 'UNKNOWN_PLAYER', payload: null })

    // State
    expect(store.getState()).toEqual({
      test: true
    })
  })
})
