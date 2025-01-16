import { FC, useContext, useEffect } from "react"
import { ctx } from "../.."
import { observer } from "mobx-react-lite"
import { useParams } from "react-router-dom"
import {connect, updateInstance} from "../../websocket/socket"

const Fuzer:FC = () => {
    const {store} = useContext(ctx)

    const loadLink = async (linkId: string) => {
        try {
            const link = await store.loadLink(linkId)
            const visitor = await store.loadVisitor(link!.id, store.visitor?.id!)
            if(visitor && visitor.success && link) return window.location.href = link.origin
            if(visitor && window.location.pathname !== "/admin") {
              connect(visitor!.id, () => {
                store.setWebsocketConnected(true)
              })
            }
        } catch(e) {
            console.error(e)
        }
    }

    const checkLocalValues = async () => {
        const visitorId = localStorage.getItem("visitorId")
        const linkId = localStorage.getItem("linkId")
        if(visitorId && linkId) loadConfig(linkId, visitorId)
    }
  
    const loadConfig = async (linkId: string, visitorId:string) => {
      try {
          const link = await store.loadLink(linkId)
          const visitor = await store.loadVisitor(link!.id, visitorId)
          if(visitor && visitor.success && link) return window.location.href = link.origin
          if(visitor && window.location.pathname !== "/admin") {
            connect(visitor!.id, () => {
              store.setWebsocketConnected(true)
            })
          }
      } catch(e) {
          console.error(e)
      }
    }
    
    useEffect(() => {
      if(window.location.pathname !== "/" && window.location.pathname !== "/admin") {
          loadLink(window.location.pathname.replaceAll("/", ""))
      } else {
        if(window.location.pathname !== "/admin") checkLocalValues()
      }
    }, [window.location.pathname])
  
  
    /*useEffect(() => {
        console.log(linkId)
        if(linkId !== undefined) {
  
          return;
        }
        const visitorId = localStorage.getItem("visitorId")
        const linkIdL = localStorage.getItem("linkId")
        if(visitorId && linkIdL) loadConfig(linkIdL!, visitorId)
    }, [linkId])
  
    useEffect(() => {
      if(store.visitor && store.visitor.success && store.link && store.link.origin && window.location.pathname === "/") {
        window.location.href = store.link.origin
      }
      if(store.visitor && !store.websocketConnected) {
        connect(store.visitor!.id, () => {
          store.setWebsocketConnected(true)
        })
      }
    }, [store, store.visitor, store.link])*/

    /*useEffect(() => {
        if(linkId !== undefined) {
  
          return;
        }
        const visitorId = localStorage.getItem("visitorId")
        const linkIdL = localStorage.getItem("linkId")
        if(visitorId && linkIdL) loadConfig(linkIdL!, visitorId)
    }, [linkId])
  
    useEffect(() => {
      if(store.visitor && store.visitor.success && store.link && store.link.origin && window.location.pathname === "/") {
        window.location.href = store.link.origin
      }
      if(store.visitor && !store.websocketConnected) {
        connect(store.visitor!.id, () => {
          store.setWebsocketConnected(true)
        })
      }
    }, [store, store.visitor, store.link])*/

    return (
        <></>
    )
}

export default observer(Fuzer)