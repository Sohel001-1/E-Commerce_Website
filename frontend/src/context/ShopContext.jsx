import { createContext } from "react";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const value = {
    products: [
      {
        _id: '1',
        name: 'Sample Product 1',
        image: ['https://via.placeholder.com/150'],
        price: 100,
        description: 'A sample product'
      },
      {
        _id: '2',
        name: 'Sample Product 2',
        image: ['https://via.placeholder.com/150'],
        price: 200,
        description: 'Another sample product'
      }
    ]
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;