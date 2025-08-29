import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import HomePage from "@/components/pages/HomePage";
import InterviewPage from "@/components/pages/InterviewPage";
import InterviewCompletePage from "@/components/pages/InterviewCompletePage";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-neutral-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/interview/:id" element={<InterviewPage />} />
          <Route path="/interview-complete" element={<InterviewCompletePage />} />
        </Routes>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </BrowserRouter>
  );
}

export default App;