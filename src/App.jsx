import { ErrorBoundary } from "./components/ErrorBoundary";
import RecuperAIDashboard from "./components/RecuperAIDashboard";

export default function App() {
  return (
    <ErrorBoundary>
      <RecuperAIDashboard />
    </ErrorBoundary>
  );
}
