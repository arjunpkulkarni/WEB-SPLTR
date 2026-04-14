import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PaymentPage from './pages/PaymentPage';
import PartyJoinPage from './pages/PartyJoinPage';
import PartyReceiptPage from './pages/PartyReceiptPage';
import PartyPayPage from './pages/PartyPayPage';
import SuccessPage from './pages/SuccessPage';
import ErrorPage from './pages/ErrorPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Flow 2: Party / Guest invite */}
        <Route path="/party/:token" element={<PartyJoinPage />} />
        <Route path="/party/:token/receipt" element={<PartyReceiptPage />} />
        <Route path="/party/:token/pay" element={<PartyPayPage />} />

        {/* Flow 3: Public pay link */}
        <Route path="/pay/:token" element={<PaymentPage />} />

        {/* Shared */}
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/" element={<Navigate to="/error" replace />} />
        <Route path="*" element={<Navigate to="/error" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
