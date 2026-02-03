import React from "react";
import "./Search.css";

const SearchSVG = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="search-svg-icon"
  >
    <path
      d="M24.0202 24.0199L33.3333 33.333"
      stroke="black"
      strokeLinecap="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16.6667 26.667C22.1895 26.667 26.6667 22.1898 26.6667 16.667C26.6667 11.1441 22.1895 6.66699 16.6667 6.66699C11.1438 6.66699 6.66666 11.1441 6.66666 16.667C6.66666 22.1898 11.1438 26.667 16.6667 26.667Z"
      stroke="black"
    />
  </svg>
);

const SearchBar = ({
  searchTerm,
  setSearchTerm,
  placeholder = "Pesquisar...",
  onFilterClick,
}) => {
  return (
    <div className="search-filter-container">
      {" "}
      {/* Novo container pai para ambos os elementos */}
      <div className="search-box">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <SearchSVG />
      </div>
      {/* Ícone de Filtro Integrado */}
    </div>
  );
};

export default SearchBar;
