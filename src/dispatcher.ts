import { NONE, TASK, BATCH, CHAIN, ERROR, State, Context, Change, Update, Command } from './types'

// Perform
export default (
  getState: () => State,
  setState: (state: State) => void
): ((update: Update, context?: Context) => Promise<Context>) => {
  // Dispatcher
  const dispatch = (update: Update, context: Context = {}): Promise<Context> => {
    // Get the state
    const [state, command]: Change = update(getState(), context)

    // Send state updates
    setState(state)

    // Execute the command
    const execute = (command: Command): Promise<Context> => {
      // Check the execution
      switch (command.type) {
        // Future
        case TASK:
          return Promise.resolve(command.task(command.context))

        // Batch
        case BATCH:
          return Promise.all(command.batch.map(execute)).then(contexts =>
            contexts.reduce((acc, ctx) => ({ ...acc, ...ctx }), command.context)
          )

        // Sequence
        case CHAIN: {
          // Load the data
          const { base, onSuccess, onError } = command

          // Execcute
          return execute(base).then(
            onSuccess != null ? nextContext => dispatch(onSuccess, nextContext) : null,
            onError ? nextContext => dispatch(onError, nextContext) : null
          )
        }

        // Error
        case ERROR:
          return execute(command.base).then(nextContext => Promise.reject(nextContext))

        // None
        case NONE:
        default:
          return Promise.resolve(command.context)
      }
    }

    // Compose the dispatch and execution
    return execute(command)
  }

  // Create dispatch
  return dispatch
}
