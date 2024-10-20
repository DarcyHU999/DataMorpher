import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App: React.FC = () => {
  const [randomNumber, setRandomNumber] = useState<number | null>(null);

  useEffect(() => {
    axios
      .get('random-number/')
      .then((response) => {
        setRandomNumber(response.data.random_number);
      })
      .catch((error) => {
        console.error('Error fetching random number:', error);
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>random number</h1>
      {randomNumber !== null ? (
        <p>random number is {randomNumber}</p>
      ) : (
        <p>loading...</p>
      )}
    </div>
  );
};

export default App;
