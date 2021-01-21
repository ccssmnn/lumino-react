import ReactDOM from "react-dom";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { BoxPanel, DockPanel, Widget } from "@lumino/widgets";
import { Provider, useSelector } from "react-redux";
import { store, useAppDispatch } from "../../app/store";
import {
  selectWidgets,
  AppWidget,
  AppWidgetType,
  deleteWidget,
  activateWidget,
} from "./widgetsSlice";
import Watcher from "../counter/Watcher";
import Incrementor from "../counter/Incrementor";
import Decrementor from "../counter/Decrementor";
import "./Lumino.css";

class LuminoWidget extends Widget {
  name: string;
  closable: boolean;
  widgetIds: string[];
  mainRef: HTMLDivElement;
  constructor(
    id: string,
    name: string,
    mainRef: HTMLDivElement,
    closable = true
  ) {
    super({ node: LuminoWidget.createNode(id) });

    this.widgetIds = [];
    this.id = id;
    this.name = name;
    this.mainRef = mainRef;
    this.closable = closable;

    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass("content");

    this.title.label = name;
    this.title.closable = closable;
  }

  static createNode(id: string) {
    const div = document.createElement("div");
    div.setAttribute("id", id);
    return div;
  }

  onActivateRequest(msg: any) {
    const event = new CustomEvent("lumino:activated", this._getEventDetails());
    this.mainRef?.dispatchEvent(event);
    super.onActivateRequest(msg);
  }

  onCloseRequest(msg: any) {
    const event = new CustomEvent("lumino:deleted", this._getEventDetails());
    this.mainRef?.dispatchEvent(event);
    super.onCloseRequest(msg);
  }
  _getEventDetails(): LuminoEvent {
    return {
      detail: {
        id: this.id,
        name: this.name,
        closable: this.closable,
      },
    };
  }
}

export interface LuminoEvent {
  detail: { id: string; name: string; closable: boolean };
}

export interface ReactWidgetProps {
  id: string;
  name: string;
}

export type ReactWidget = React.FC<ReactWidgetProps>;

const getComponent = (type: AppWidgetType): ReactWidget => {
  switch (type) {
    case "WATCHER":
      return Watcher;
    case "INCREMENTOR":
      return Incrementor;
    case "DECREMENTOR":
      return Decrementor;
    default:
      return Watcher;
  }
};

const main = new BoxPanel({ direction: "left-to-right", spacing: 0 });
const dock = new DockPanel();

const Lumino: React.FC = () => {
  const [attached, setAttached] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const [renderedWidgetIds, setRenderedWidgetIds] = useState<string[]>([]);
  const widgets = useSelector(selectWidgets);
  const dispatch = useAppDispatch();

  const addWidget = useCallback((w: AppWidget) => {
    if (mainRef.current === null) return;
    setRenderedWidgetIds((cur) => [...cur, w.id]);
    const lum = new LuminoWidget(w.id, w.tabTitle, mainRef.current, true);
    dock.addWidget(lum);
  }, []);

  // add widgets to dock
  useEffect(() => {
    if (!attached) return;
    widgets.forEach((w) => {
      if (renderedWidgetIds.includes(w.id)) return;
      addWidget(w);
      const el = document.getElementById(w.id);
      const Component = getComponent(w.type);
      if (el) {
        ReactDOM.render(
          <Provider store={store}>
            <Component id={w.id} name={w.tabTitle} />
          </Provider>,
          el
        );
      }
    });
  }, [widgets, attached, addWidget, renderedWidgetIds]);

  // attach lumino dock to main component
  useEffect(() => {
    if (mainRef.current === null || attached === true) {
      return;
    }
    main.id = "main";
    main.addClass("main");
    dock.id = "dock";
    window.onresize = () => main.update();
    BoxPanel.setStretch(dock, 1);
    Widget.attach(main, mainRef.current);
    setAttached(true);
    main.addWidget(dock);
    mainRef.current.addEventListener("lumino:activated", (e: Event) => {
      const le = (e as unknown) as LuminoEvent;
      dispatch(activateWidget(le.detail.id));
    });
    mainRef.current.addEventListener("lumino:deleted", (e: Event) => {
      const le = (e as unknown) as LuminoEvent;
      dispatch(deleteWidget(le.detail.id));
    });
  }, [mainRef, attached, dispatch]);

  return (
    <div id="workflow-panel">
      <div ref={mainRef} className={"main"}></div>
    </div>
  );
};

export default Lumino;
