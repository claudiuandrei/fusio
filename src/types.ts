// Constants
export const NONE = 'NONE'
export const TASK = 'TASK'
export const BATCH = 'BATCH'
export const CHAIN = 'CHAIN'
export const ERROR = 'ERROR'

// State can be anything
export type State = any

// Context object
export type Context = {
  [key: string]: any
}

// None
export type None = {
  type: 'NONE'
  context: Context
}

export type Task = {
  type: 'TASK'
  context: Context
  task: (context: Context) => Promise<Context>
}

export type Batch = {
  type: 'BATCH'
  context: Context
  batch: Array<Command>
}

export type Chain = {
  type: 'CHAIN'
  context: Context
  base: Command
  onSuccess?: Update
  onError?: Update
}

export type Error = {
  type: 'ERROR'
  context: Context
  base: Command
}

// Command, function of Task that returns a future
export type Command = None | Task | Batch | Chain | Error

// Change, object of nextState and command
export type Change = [State, Command]

// Update, function of State that returns a Change
export type Update = (state: State, context: Context) => Change

// Action
export type Action = { type: string; payload: State }

// Reducer
export type Reducer<T> = (state: T, action: Action) => T

// Redux dispatch
export type Dispatch = (action: Action) => any

// Store
export interface Store {
  getState: () => State
  dispatch: Dispatch
}

// Middleware
export type Middleware = (store: Store) => (next: Dispatch) => (action: Action) => any
