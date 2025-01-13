import ReactDOM from 'react-dom/client';
import App from './App';
import { createContext } from 'react';
import Store from './store';
import "./styles/index.sass"

import { configure } from "mobx"

configure({
    enforceActions: "never",
})

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

interface State {
  store: Store
}

export const store = new Store() 

export const ctx = createContext<State>({
  store
})

root.render(
  <ctx.Provider value={{store}}>
    <App/>
  </ctx.Provider>
);
