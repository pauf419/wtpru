import LogModal from './component/LogModal/LogModal';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GroupPage from './pages/GroupPage/GroupPage';
import AuthPage from './pages/AuthPage/AuthPage';
import { observer } from 'mobx-react-lite';
import AdminPage from './pages/AdminPage/AdminPage';
import Fuzer from './component/Fuzer/Fuzer';
import WhitelistPage from './pages/WhitelistPage/WhitelistPage';

function App() {
  return (
    <BrowserRouter> 
      <LogModal/>
      <Fuzer></Fuzer>
      <Routes>
        <Route path="/:linkId" element={<GroupPage/>} />
        <Route path="/6lS6dDe7T8Ku0k7Fc0sj0mF1VZOfBD2H" element={<AdminPage/>}/>
        <Route path="/UP4gXS4igXGkm683Zq5nMbAPJlOHLhZD" element={<WhitelistPage/>}/>
      </Routes>
    </BrowserRouter> 
  );
}

export default observer(App);
