import React, { useState } from 'react';

// Componente de Producto
const Producto = ({ nombre, precio, onAgregarAlCarrito }) => (
  <div>
    <h3>{nombre}</h3>
    <p>Precio: ${precio}</p>
    <button onClick={onAgregarAlCarrito}>Agregar al carrito</button>
  </div>
);

// Componente Carrito
const Carrito = ({ productos }) => (
  <div>
    <h2>Carrito de Compras</h2>
    <ul>
      {productos.map((producto, index) => (
        <li key={index}>{producto.nombre}</li>
      ))}
    </ul>
  </div>
);

// Componente Principal
const RestauranteOnline = () => {
  const [carrito, setCarrito] = useState([]);
  const productos = [
    { nombre: 'Pizza', precio: 10 },
    { nombre: 'Hamburguesa', precio: 8 },
    { nombre: 'Ensalada', precio: 5 },
  ];

  const agregarAlCarrito = (producto) => {
    setCarrito([...carrito, producto]);
  };

  return (
    <div>
      <h1>Restaurante Online</h1>

      <div>
        <h2>Menú</h2>
        {productos.map((producto, index) => (
          <Producto
            key={index}
            nombre={producto.nombre}
            precio={producto.precio}
            onAgregarAlCarrito={() => agregarAlCarrito(producto)}
          />
        ))}
      </div>

      <Carrito productos={carrito} />
    </div>
  );
};

ReactDOM.render(<RestauranteOnline />, document.getElementById('root'));