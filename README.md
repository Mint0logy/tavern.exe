# Tavern.exe

A fantasy RPG powered by a custom neural network.

## Project structure

- `apps/web` - React, TypeScript, and Vite frontend
- `apps/api` - Node.js HTTP API written in TypeScript
- `packages/brain` - C++20 brain executable
- `data` - training datasets
- `models` - trained model weights

## Build the C++ brain

Run from the repository root:

```bash
cmake -S packages/brain -B packages/brain/build
cmake --build packages/brain/build
```

## Run the application

In separate terminals, from the repository root:

```bash
npm --prefix apps/api start
```

```bash
npm --prefix apps/web run dev
```

The API starts on port `3000` and compiles its TypeScript source before starting. Vite starts on port `5173` and proxies `/api` requests to the API.
