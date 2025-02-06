import { useState } from "react";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Electron React Template</h1>
        <div className="card">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            count is {count}
          </button>
          <p className="mt-4">
            Edit <code>src/App.tsx</code> to get started
          </p>
        </div>
      </div>
    </>
  );
}

export default App;
