import { useHashRoute } from './hooks/useHashRoute.js';
import Layout from './components/Layout.jsx';
import Analytics from './pages/Analytics.jsx';
import Dashboard from './pages/Dashboard.jsx';
import StudyTimer from './pages/StudyTimer.jsx';
import Subjects from './pages/Subjects.jsx';
import Tasks from './pages/Tasks.jsx';

// Which component shows for which page name.
const PAGES = {
  dashboard: Dashboard,
  tasks: Tasks,
  subjects: Subjects,
  timer: StudyTimer,
  analytics: Analytics,
};

export default function App() {
  const route = useHashRoute();
  const Page = PAGES[route];

  return (
    <Layout route={route}>
      <Page />
    </Layout>
  );
}
