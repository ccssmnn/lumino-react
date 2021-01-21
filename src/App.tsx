import React from "react";
import Lumino from "./features/widgets/Lumino";
import { useAppDispatch } from "./app/store";
import {
  addIncrementor,
  addDecrementor,
  addWatcher,
} from "./features/widgets/widgetsSlice";

import "./App.css";

function App() {
  const dispatch = useAppDispatch();
  return (
    <div className="App">
      <button onClick={() => dispatch(addIncrementor())}>
        Add Incrementor!
      </button>
      <button onClick={() => dispatch(addDecrementor())}>
        Add Decrementor!
      </button>
      <button onClick={() => dispatch(addWatcher())}>Add Watcher!</button>
      <Lumino />
    </div>
  );
}

export default App;
