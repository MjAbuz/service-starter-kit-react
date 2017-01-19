import get from 'lodash.get';

import {
    JSON_API_REQUEST,
    JSON_API_SUCCESS,
    JSON_API_FAILURE
} from '../actions/types';

const initialState = {};

const requestsReducer = (state = initialState, action) => {
    const existing = get(state, 'action.meta.dataKey');

    switch (action.type) {
        case JSON_API_REQUEST:
            return {
                ...state,
                [action.meta.dataKey]: {
                    ...existing,
                    status: 'pending',
                    isLoading: true,
                    pending: action.meta.method
                }
            };
        case JSON_API_SUCCESS:
            return {
                ...state,
                [action.meta.dataKey]: {
                    ...existing,
                    status: 'success',
                    fetchedAt: Date.now(),
                    isError: false,
                    isLoaded: true,
                    isLoading: false
                }
            };
        case JSON_API_FAILURE:
            return {
                ...state,
                [action.meta.dataKey]: {
                    ...existing,
                    status: 'error',
                    name: action.payload.name,
                    errors: [action.payload.message],
                    fetchedAt: Date.now(),
                    isError: true,
                    isLoaded: false,
                    isLoading: false,
                    pending: undefined
                }
            };
        default:
            return state;
    }
};

export default requestsReducer;
