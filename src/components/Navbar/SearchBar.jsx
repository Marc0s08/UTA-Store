import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css"; // Ou mantendo no CSS global da Navbar

export default function SearchBar({ placeholder = "Buscar produtos..." }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/produtos?busca=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form className="modern-search-bar" onSubmit={handleSearch}>
      <button type="submit" className="search-btn" aria-label="Buscar">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="search-input"
      />

      {query && (
        <button
          type="button"
          className="search-clear-btn"
          onClick={() => setQuery("")}
        >
          ✕
        </button>
      )}
    </form>
  );
}