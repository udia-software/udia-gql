import { combineReducers } from "redux";
import { NODE_ENV } from "../constants";

/* ==== SHARED ENVIRONMENT ====
 * Send relevant environment variables to the client through the redux store
 */
export interface ISharedEnvironment {
  NODE_ENV: string;
}
const SharedEnvironment: ISharedEnvironment = {
  NODE_ENV
};
const environmentReducer = (state = SharedEnvironment) => ({
  ...state
});

/* ==== USER PERSISTANCE ====
 * Set user id in redux store for universal identity tracking
 */
export interface IUserUniversalData {
  userId?: string | null;
}
const UserUniversalData: IUserUniversalData = {};

export const SET_USER_ID = "user/SET_USER_ID";
export interface ISetUserIDAction {
  type: typeof SET_USER_ID;
  payload: string | null;
}
export const setUserId = (userid: string | null): ISetUserIDAction => ({
  type: SET_USER_ID,
  payload: userid
});
export type IUserUniversalAction = ISetUserIDAction;

const userUniversalReducer = (
  state = UserUniversalData,
  action: IUserUniversalAction
) => {
  switch (action.type) {
    case SET_USER_ID:
      return {
        ...state,
        userId: action.payload
      };
    default:
      return { ...state };
  }
};

/* ==== ROOT REDUCER ====
 * Combine all sub reducers and make the root reducer
 */
export interface IRootState {
  environment: ISharedEnvironment;
  userUniversal: IUserUniversalData;
}
export const rootReducer = combineReducers({
  environment: environmentReducer,
  userUniversal: userUniversalReducer
});
