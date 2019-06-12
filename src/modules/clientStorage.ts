if (!("localStorage" in window)) {
  (window as any).localStorage = {
    _data: {},
    setItem(id: string, val: any) {
      return (this._data[id] = String(val));
    },
    getItem(id: string) {
      return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
    },
    removeItem(id: string) {
      return delete this._data[id];
    },
    clear() {
      return (this._data = {});
    }
  };
}
