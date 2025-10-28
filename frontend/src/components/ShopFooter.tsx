// src/components/ShopFooter.tsx
import React from 'react';

const ShopFooter = () => {
  return (
    <footer className="footer mt-auto py-3 bg-light border-top">
      <div className="container-fluid d-flex justify-content-between px-4">
        <span className="text-muted">
          <a href="#" className="text-decoration-none text-muted">CoreUI</a> © 2025 creativeLabs.
        </span>
        <span className="text-muted">
          Powered by <a href="#" className="text-decoration-none">CoreUI for React</a>
        </span>
      </div>
    </footer>
  );
};

export default ShopFooter;