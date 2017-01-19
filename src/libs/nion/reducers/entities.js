import get from 'lodash.get';
import map from 'lodash.map';
// DK DIFF FROM NION -- import { camelizeKeys, camelize } from 'humps';

import {
    JSON_API_SUCCESS,
    JSON_API_BOOTSTRAP,
    UPDATE_ENTITY
} from '../actions/types';

const initialState = {};

// The core reducer for maintaining a normalized entity store of entities that are fetched / updated
// between different JSON API actions
const entitiesReducer = (state = initialState, action) => {
    switch (action.type) {
        case JSON_API_SUCCESS:
        case JSON_API_BOOTSTRAP: {
            const newState = {
                ...state
            };

            const storeFragment = get(action, 'payload.storeFragment', {});
            map(storeFragment, (entities, uncamelizedType) => {
                const type = uncamelizedType; // DK DIFF FROM NION -- camelize(uncamelizedType);

                newState[type] = {
                    ...get(newState, type, {})
                };

                map(entities, (entity, id) => {
                    newState[type][id] = {
                        type,
                        id,
                        attributes: {
                            ...get(newState[type][id], 'attributes', {}),
                            // DK DIFF FROM NION -- ...camelizeKeys(get(entity, 'attributes', {}))
                            ...get(entity, 'attributes', {})
                        },
                        relationships: {
                            ...get(newState[type][id], 'relationships', {}),
                            // DK DIFF FROM NION -- ...camelizeKeys(get(entity, 'relationships', {}))
                            ...get(entity, 'relationships', {})
                        }
                    };
                });
            });

            const entityToDelete = get(action, 'meta.refToDelete');
            if (entityToDelete && entityToDelete.id !== undefined && entityToDelete.type) {
                delete newState[entityToDelete.type][entityToDelete.id];
            }
            return newState;
        }
        case UPDATE_ENTITY: {
            const { type, id, attributes } = action.payload;
            const entity = state[type][id];
            const newEntity = {
                ...entity,
                attributes: {
                    ...entity.attributes,
                    ...attributes
                }
            };

            const newState = {
                ...state,
                [type]: {
                    ...state[type],
                    [id]: newEntity
                }
            };

            return newState;
        }
        default:
            return state;
    }
};

export default entitiesReducer;
