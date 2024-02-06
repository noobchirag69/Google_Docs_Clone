import { TextEditor } from "./components/TextEditor";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react"; // Import useEffect hook
import { v4 as uuidV4 } from "uuid";

const App = () => {
  const redirect = useNavigate();

  useEffect(() => {
    const id = uuidV4(); // Generate UUID string
    redirect(`/documents/${id}`); // Redirect to the generated UUID string
  }, [redirect]); // useEffect runs only once after the initial render

  return (
    <>
      <Routes>
        <Route path={"/"} element={<></>} /> {/* Placeholder route */}
        <Route path={"/documents/:id"} element={<TextEditor />} />
      </Routes>
    </>
  );
};

export default App;
