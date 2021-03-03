import React, { useState, useReducer, useCallback } from 'react';
import IngredientList from './IngredientList';
import ErrorModal from '../UI/ErrorModal';
import IngredientForm from './IngredientForm';
import Search from './Search';

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

const httpReducer = (httpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { loading: true, error: null };
    case 'RESPONSE':
      return { ...httpState, loading: false };
    case 'ERROR':
      return { loading: false, error: action.error };
    default:
      throw new Error('Should not get to error');
  }
};

function Ingredients() {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [] = useReducer(httpReducer, { loading: false, error: null });
  // const [userIngredients, setUserIngredients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    // setUserIngredients(filteredIngredients);
    dispatch({ type: 'SET', ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = (ingredient) => {
    setIsLoading(true);
    fetch(
      'https://udemy-ingredient-list-default-rtdb.firebaseio.com/ingredients.json',
      {
        method: 'POST',
        body: JSON.stringify(ingredient),
        headers: { 'Content-Type': 'application/json' },
      }
    )
      .then((response) => {
        setIsLoading(false);
        return response.json();
      })
      .then((data) => {
        // setUserIngredients((prevIngredients) => [
        //   ...prevIngredients,
        //   { id: data.name, ...ingredient },
        // ]);
        dispatch({ type: 'ADD', ingredient: { id: data.name, ...ingredient } });
      });
  };

  const removeIngredientHandler = (id) => {
    setIsLoading(true);
    fetch(
      `https://udemy-ingredient-list-default-rtdb.firebaseio.com/ingredients/${id}.json`,
      {
        method: 'DELETE',
      }
    )
      .then((response) => {
        setIsLoading(false);
        // setUserIngredients((prevIngredients) =>
        //   prevIngredients.filter((ing) => ing.id !== id)
        // );
        dispatch({ type: 'DELETE', id });
      })
      .catch((error) => {
        setError(error.message);
        setIsLoading(false);
      });
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div className="App">
      {error ? <ErrorModal onClose={clearError}>{error}</ErrorModal> : null}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
}

export default Ingredients;
