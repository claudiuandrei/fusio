import { NONE, TASK, BATCH, CHAIN, ERROR, State, Context, Change, Update, Command } from './types'

// Create
export const reference = (state: State, context: Context): Change => [
  state,
  {
    type: NONE,
    context
  }
]

// Create
export const task = (input: (ctx: Context) => Promise<Context>) => (
  state: State,
  context: Context
): Change => [
  state,
  {
    type: TASK,
    context,
    task: input
  }
]

// Batch changes
export const batch = (updates: Array<Update>) => (state: State, context: Context): Change => {
  // Create a state reducer
  type Reducer = { state: State; context: Context; commands: Array<Command> }

  // Load the state and commands
  const next: Reducer = updates.reduce(
    (step: Reducer, update: Update) => {
      // Load the next state
      const [nextState, command]: Change = update(step.state, context)

      // Return the next state and the commands
      return {
        state: nextState,
        context: { ...step.context, ...command.context },
        commands:
          command.type === BATCH
            ? [...step.commands, ...command.batch]
            : [...step.commands, command]
      }
    },
    {
      state,
      context,
      commands: []
    }
  )

  // Create a new batched update
  return [
    next.state,
    {
      type: BATCH,
      context: next.context,
      batch: next.commands
    }
  ]
}

// Chain
export const chain = (onSuccess?: Update, onError?: Update) => (update: Update) => (
  state: State,
  context: Context
): Change => {
  // Get the update
  const [nextState, command]: Change = update(state, context)

  // Return the chain
  return [
    nextState,
    {
      type: CHAIN,
      context,
      base: command,
      onSuccess,
      onError
    }
  ]
}

// Wrap the command in an error
export const error = (update: Update) => (state: State, context: Context): Change => {
  // Load the next data
  const [nextState, command]: Change = update(state, context)

  // Set the next data
  return [
    nextState,
    {
      type: ERROR,
      context,
      base: command
    }
  ]
}
