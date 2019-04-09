# Fusio<sup>(n)</sup> Reactor

## Worflow management based on Elm Architecture

Fusio<sup>(n)</sup> Reactor is a basic declarative worflow mangement that is inspired by Elm Architecture. It comes with out of the box connectors for Redux, but it is useful in many other contexts, or with other libraries.

For more info check out the presentation: https://www.youtube.com/watch?v=l5K01MAi2Ek

If you need complex workflows, use Redux Saga, it is way more powerful.

### Concepts

While Redux only handles state changes, this library handles both state changes and declarative side-effects in the same place. By having them colocated, it provides a clear view of the results.

A worflow is a function that will take a state and a context and will return the next state and a description of the side-effects to be performed.

The library comes with some helpers that facilitate that (`reference`, `task`, `chain`, `batch`. `error`). It also offers a set of helpers to connect to Redux (`enhanceReducer`, `createMiddleware`).

#### Reference

The reference is just a simple way to create a worflow with no side-effects. Does nothing except wrap the state and context and pass them further. This is the ideal way to only change the state.

```typescript
type Workflow = (state: State, context: Context) => Change
```

#### Task

The task is a way to wrap a promise into a workflow.

```typescript
type Task = (input: (ctx: Context) => Promise<Context>) => Workflow
```

#### Chain

A chain is allowing composition of worflows that will be run in sequence. It also allows the to handle errors on the previous workflows.

```typescript
type Chain = (onSuccess?: Workflow, onError?: Workflow) => (workflow: Workflow) => Workflow
```

#### Batch

A batch is allowing composition of worflows that will be run in parallel. It merges all the worflows into one after every one of them finishes.

```typescript
type Batch = (worflows: Array<Workflow>) => Workflow
```

#### Error

The error wrapper transforms a failed worflow into a successful one. This is probably rarely needed, but in some cases we want to catch the error and continue our worflow.

```typescript
type Error = (worflow: Workflow) => Workflow
```

### Setup

```bash
yarn add fusio
```

or

```bash
npm install --save fusio
```

### Usage

Before you start import the functions from the library

```javascript
import { reference, task, chain, batch, error, enhanceReducer, createMiddleware } from 'fusio'
```

#### Connect to Redux

```javascript
// Create the store
import { createStore, applyMiddleware } from 'redux'

// Map
const updates = {
  CREATE_PLAYER
}

// Create the saga middleware
const fusioMiddleware = createMiddleware(key => update[key])

// Mount it on the Store
const store = createStore(enhanceReducer(reducer), applyMiddleware(fusioMiddleware))

// Load the dispatch value
store.dispatch({ type: 'CREATE_PLAYER', payload: { name: 'John Doe' } })
```

## License

[MIT](LICENSE)
