import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar() {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Pesquisar produtos..."
      />

      <button>
        <SearchIcon />
      </button>
    </div>
  );
}