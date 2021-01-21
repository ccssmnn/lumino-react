import React from "react";
import { increment } from "./counterSlice";
import "./Incrementor.css";
import { useAppDispatch } from "../../app/store";
import { ReactWidget } from "../widgets/Lumino";

const Incrementor: ReactWidget = () => {
  const dispatch = useAppDispatch();
  return (
    <div className="incrementor">
      <button onClick={() => dispatch(increment())}>Increment Count</button>
    </div>
  );
};

export default Incrementor;
