import { combineReducers, createStore, Store, StoreEnhancer } from "redux";
import { DYNAMODB_STAGE } from "../constants";

/* ==== SHARED ENVIRONMENT ====
 * Send relevant environment variables to the client through the redux store
 */
export interface ISharedEnvironment {
  STAGE: string;
}
const SharedEnvironment: ISharedEnvironment = {
  STAGE: DYNAMODB_STAGE
};
const environmentReducer = (state = SharedEnvironment) => ({
  ...state,
});

/* ==== ROOT REDUCER ====
 * Combine all sub reducers and make the root reducer
 */
export interface IRootState {
  environment: ISharedEnvironment;
}
export const rootReducer = combineReducers({
  environment: environmentReducer,
});

export default (initialState?: StoreEnhancer<{}, {}>): Store<{}> => {
  return createStore(rootReducer, initialState);
};
