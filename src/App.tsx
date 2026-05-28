import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useLibraryStore } from "./store/useLibraryStore";
import ReaderPage from "./pages/ReaderPage";
import ShelfPage from "./pages/ShelfPage";

export default function App() {
  const loadBooks = useLibraryStore((state) => state.loadBooks);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  return (
    <Routes>
      <Route path="/" element={<ShelfPage />} />
      <Route path="/reader/:bookId" element={<ReaderPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
