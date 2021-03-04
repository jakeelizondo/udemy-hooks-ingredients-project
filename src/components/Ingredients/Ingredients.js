import React, {
  useState,
  useReducer,
  useCallback,
  useMemo,
  useEffect,
} from 'react';

import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import IngredientForm from './IngredientForm';
import Search from './Search';
import useHttp from '../../hooks/http';

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter((ing) => ing.id !== action.id);
    default:
      throw new Error('Should not get to error');
  }
};

function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const {
    isLoading,
    error,
    data,
    sendRequest,
    reqExtra,
    reqIdentifier,
    clear,
  } = useHttp();

  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === 'DEL_ING') {
      dispatch({ type: 'DELETE', id: reqExtra });
    } else if (!isLoading && !error && reqIdentifier === 'ADD_ING') {
      dispatch({ type: 'ADD', ingredient: { id: data.name, ...reqExtra } });
    }
  }, [data, reqExtra, reqIdentifier, isLoading, error]);

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    // setUserIngredients(filteredIngredients);
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = useCallback(
    (ingredient) => {
      sendRequest(
        'https://udemy-ingredient-list-default-rtdb.firebaseio.com/ingredients.json',
        'POST',
        JSON.stringify(ingredient),
        ingredient,
        'ADD_ING'
      );
      // dispatchHttp({ type: 'SEND' });
      // fetch(
      //   'https://udemy-ingredient-list-default-rtdb.firebaseio.com/ingredients.json',
      //   {
      //     method: 'POST',
      //     body: JSON.stringify(ingredient),
      //     headers: { 'Content-Type': 'application/json' },
      //   }
      // )
      //   .then((response) => {
      //     dispatchHttp({ type: 'RESPONSE' });
      //     return response.json();
      //   })
      //   .then((data) => {
      //     // setUserIngredients((prevIngredients) => [
      //     //   ...prevIngredients,
      //     //   { id: data.name, ...ingredient },
      //     // ]);
      //     dispatch({ type: 'ADD', ingredient: { id: data.name, ...ingredient } });
      //   });
    },
    [sendRequest]
  );

  const removeIngredientHandler = useCallback(
    (id) => {
      // dispatchHttp({ type: 'SEND' });
      sendRequest(
        `https://udemy-ingredient-list-default-rtdb.firebaseio.com/ingredients/${id}.json`,
        'DELETE',
        null,
        id,
        'DEL_ING'
      );
    },
    [sendRequest]
  );

  // const clearError = useCallback(() => {
  //   // dispatchHttp({ type: 'CLEAR' });

  // }, []);

  const ingredientList = useMemo(() => {
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [userIngredients, removeIngredientHandler]);

  return (
    <div className="App">
      {error ? <ErrorModal onClose={clear}>{error}</ErrorModal> : null}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
