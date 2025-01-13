import React, { useContext, useEffect } from 'react';
import LogModal from './component/LogModal/LogModal';
import { ctx } from '.';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import GroupPage from './pages/GroupPage/GroupPage';
import AuthPage from './pages/AuthPage/AuthPage';
import { observer } from 'mobx-react-lite';

import {connect, updateInstance} from "./websocket/socket"
import AdminPage from './pages/AdminPage/AdminPage';

function App() {

  const {store} = useContext(ctx)

  const loadConfig = async (linkId: string, visitorId:string) => {
    try {
        const link = await store.loadLink(linkId)
        const visitor = await store.loadVisitor(link!.id, visitorId)
        if(visitor) {
          connect(visitor!.id, () => {
            store.setWebsocketConnected(true)
          })
        }
    } catch(e) {
        console.error(e)
    }
}

  useEffect(() => {
    const visitorId = localStorage.getItem("visitorId")
    const linkId = localStorage.getItem("linkId")
    if(visitorId && linkId) loadConfig(linkId, visitorId)
  }, [])

  return (
    <BrowserRouter> 
      <LogModal/>
      <Routes>
        <Route path="/:linkId" element={<GroupPage/>} />
        <Route path="/admin" element={<AdminPage/>}/>
        <Route path="/" element={<AuthPage/>}/>
      </Routes>
    </BrowserRouter> 
  );
}

export default observer(App);
