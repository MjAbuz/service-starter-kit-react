// DK DIFF FROM NION -- import { camelizeKeys } from 'humps';

const initialState = {};

import {
    JSON_API_REQUEST,
    JSON_API_BOOTSTRAP,
    JSON_API_SUCCESS,
    GENERIC_BOOTSTRAP,
    INITIALIZE_DATAKEY
} from '../actions/types';

// Yes, a bit funny - but it turns out this is a safe, fast, and terse way of deep cloning data
const clone = (input) => JSON.parse(JSON.stringify(input));

const deleteRefFromEntities = (refToDelete = {}, state = {}) => {
    const { type, id } = refToDelete;
    if (!id || !type) {
        return state;
    }

    // Iterate over all dataKeys on state to remove all instance of the
    // ref to be deleted
    return Object.keys(state).reduce((memo, dataKey) => {
        const oldEntites = state[dataKey].entities;

        if (Array.isArray(oldEntites)) {
            memo[dataKey] = {
                ...state[dataKey],
                entities: oldEntites.filter((entity) => {
                    return !(entity.type === type && entity.id === id);
                })
            };
        } else {
            memo[dataKey] = state[dataKey];
        }
        return memo;
    }, {});
};

const refsReducer = (state = initialState, action) => {
    switch (action.type) {
        case JSON_API_REQUEST:
            return state;
        case JSON_API_BOOTSTRAP:
        case JSON_API_SUCCESS:
            // If the result of a paginated nextPage request, we're going to want to append the
            // retrieved entities to the end of the current entities list
            if (action.meta.isNextPage) {
                const nextPageRef = action.payload.newRequestRef;
                return {
                    ...state,
                    [action.meta.dataKey]: {
                        ...nextPageRef,
                        entities: state[action.meta.dataKey].entities.concat(nextPageRef.entities)
                    }
                };
            } else if (action.meta.refToDelete) {
                // Else, if the result of a DELETE request, we must process delete corresponding refs
                // off of the references state

                return {
                    // if there's no ref to delete, this is a no-op
                    ...deleteRefFromEntities(action.meta.refToDelete, state)
                };
            }

            // Otherwise, append the new ref to the state
            return {
                ...state,
                [action.meta.dataKey]: action.payload.newRequestRef
            };

        // Handle generic refs to non json-api data
        case GENERIC_BOOTSTRAP:
            return {
                ...state,
                // DK DIFF FROM NION -- [action.meta.dataKey]: camelizeKeys(clone(action.payload))
                [action.meta.dataKey]: clone(action.payload)
            };

        // Initialize a new dataKey from a ref passed to a child component
        case INITIALIZE_DATAKEY:
            return {
                ...state,
                [action.payload.dataKey]: clone(action.payload.ref)
            };

        default:
            return state;
    }
};

export default refsReducer;
