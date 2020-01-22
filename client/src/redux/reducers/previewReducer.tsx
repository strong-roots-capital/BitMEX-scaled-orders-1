import {
  POST_ORDER_SUCCESS,
  POST_ORDER_ERROR,
  POST_ORDER_LOADING,
  PREVIEW_ORDERS_SUCCESS,
  PREVIEW_ORDERS_CLOSE
} from "../actions/actionTypes";

import { PostOrder } from "../actions/previewActions";
import { PreviewState } from "../models/state";

const initialState = {
  orders: {},
  error: "",
  showPreview: false,
  loading: false
};

export default (
  state: PreviewState = initialState,
  action: PostOrder
): PreviewState => {
  switch (action.type) {
    case POST_ORDER_LOADING:
      return { ...state, error: "", loading: true };
    case POST_ORDER_SUCCESS:
      return {
        ...state,
        ...action.payload,
        showPreview: false,
        error: "",
        orders: [],
        loading: false
      };
    case POST_ORDER_ERROR:
      return {
        ...state,
        showPreview: false,
        orders: [],
        error: action.payload,
        loading: false
      };
    case PREVIEW_ORDERS_SUCCESS:
      return {
        ...state,
        orders: action.payload,
        showPreview: true,
        error: ""
      };
    case PREVIEW_ORDERS_CLOSE:
      return {
        ...state,
        showPreview: !state.showPreview,
        error: ""
      };
    default:
      return state;
  }
};
