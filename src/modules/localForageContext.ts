import localforage from "localforage";
import React from "react";

export const LocalForage = localforage.createInstance({
  name: "udia",
  description: "Udia client only persistance."
});

export const LocalForageContext = React.createContext(LocalForage);
