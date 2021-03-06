import {
  ORDER_SUCCESS,
  ORDER_ERROR,
  ORDER_LOADING,
  SHOW_PREVIEW,
  SWITCH_PREVIEW,
  BALANCE_SUCCESS,
  PreviewActionTypes,
  PreviewState
} from "./types";

import axios from "axios";
import { orderBulk, market_order } from "../../../util";
import { Thunk } from "../../models/state";

const initialState = {
  orders: [],
  balance: 0,
  error: "",
  showPreview: false,
  loading: false,
  message: ""
};
// Reducer
export const previewReducer = (
  state: PreviewState = initialState,
  action: PreviewActionTypes
): PreviewState => {
  switch (action.type) {
    case ORDER_LOADING:
      return { ...state, error: "", loading: true, message: "" };
    case ORDER_SUCCESS:
      return {
        ...state,
        showPreview: false,
        message: action.payload,
        error: "",
        orders: [],
        loading: false
      };
    case BALANCE_SUCCESS:
      return {
        ...state,
        balance: action.payload
      };
    case ORDER_ERROR:
      return {
        ...state,
        showPreview: false,
        orders: [],
        error: action.payload,
        loading: false
      };
    case SHOW_PREVIEW:
      return {
        ...state,
        orders: action.payload,
        showPreview: true,
        error: ""
      };
    case SWITCH_PREVIEW:
      return {
        ...state,
        showPreview: !state.showPreview,
        error: ""
      };
    default:
      return state;
  }
};

// Actions
// ==============================

/**
 * [Order bulk] action creator
 * @param {Object} payload order details
 * @returns {Object} success response(dispatch action)
 */
export const postOrder = (payload: any): Thunk => async dispatch => {
  try {
    dispatch(postOrderLoading());
    let orders = orderBulk(payload);

    if (payload.stop && payload.stop !== "") {
      orders.orders.push(orders.stop);
    }
    console.log("order");

    const response = await axios.post("/bitmex/postOrder", orders);
    const { success } = response.data;
    dispatch(postOrderSuccess({ success, from: "Scaled_orders" }));
  } catch (err) {
    if (err.message.includes("500")) {
      dispatch(postOrderError("Server is offline."));
    } else {
      dispatch(postOrderError(err.response.data.error));
    }
  }
};

/**
 * [Get Balance] action creator
 * @returns {Object} success response(dispatch action)
 */
export const getBalance = (): Thunk => async dispatch => {
  try {
    const response = await axios.post("/bitmex/getBalance");
    const { data } = response.data;
    const { walletBalance } = JSON.parse(data);
    dispatch(getBalanceSuccess(walletBalance));
  } catch (err) {
    // console.log(response.data);
    if (err.message.includes("500")) {
      dispatch(postOrderError("Server is offline."));
    } else {
      dispatch(postOrderError(err.response.data.error));
    }
  }
};

export const marketOrder = (payload: any): Thunk => async dispatch => {
  try {
    dispatch(postOrderLoading());
    const order = market_order(payload);

    const response = await axios.post("/bitmex/marketOrder", order);
    const { success } = response.data;
    dispatch(postOrderSuccess({ success, from: "Market_order" }));
  } catch (err) {}
};

/**
 * SUCCESS [Current price of symbol] action creator
 * @param {number} currentPrice of a symbol
 * @returns {Object} SUCCESS action to reducer
 */
export const previewOrders = (payload: any): PreviewActionTypes => {
  const orders = orderBulk(payload);
  return {
    type: SHOW_PREVIEW,
    payload: orders
  };
};

export const getBalanceSuccess = (payload: number): PreviewActionTypes => ({
  type: BALANCE_SUCCESS,
  payload
});

const postOrderLoading = (): PreviewActionTypes => ({
  type: ORDER_LOADING
});

const postOrderSuccess = ({ success, from }: any): PreviewActionTypes => ({
  type: ORDER_SUCCESS,
  payload: success === 200 ? `Success: <${from}>` : "Message"
});

const postOrderError = (payload: any): PreviewActionTypes => ({
  type: ORDER_ERROR,
  payload
});

export const previewClose = (): PreviewActionTypes => ({
  type: SWITCH_PREVIEW
});
