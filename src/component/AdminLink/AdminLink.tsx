
import { FC, useState, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ctx } from "../..";
import LinkService from "../../services/LinkService";
import m from "./AdminLink.module.sass"
import { useQuery } from "../../hooks/useQueryHook";
import { useParams } from "react-router-dom";
import { socket } from "../../websocket/socket";
import Input from "../../component/Input/Input";
import { ILink } from "../../models/ILink";
import { IAdminLink } from "../../models/IAdminLink";
import AdminService from "../../services/AdminService";


interface AdminLinkProps {
    link: IAdminLink
    deleteCb: (id: string) => void
    swapCb: (id:string|undefined) => void
    completeSwapCb: (index:number) => void
    swapCursor: boolean
    swapSelection: boolean
}

const AdminLink: FC<AdminLinkProps> = ({link, deleteCb, swapCb, completeSwapCb, swapCursor, swapSelection}) => {

    const [subscribers, setSubscribers] = useState<number>()
    const [timeoutId, setTimeoutId] = useState<number>(0)

    const handleDelete = async () => {
        deleteCb(link.id)
    }

    useEffect(() => {
        clearTimeout(timeoutId)
        if(subscribers) {
            const tid= setTimeout(async () => {
                await AdminService.updateLinkSubscribers(link.id, subscribers)
            }, 1000)
            setTimeoutId(Number(tid))
        }
    }, [subscribers])

    return (
        <tr className={`${m.Tr} ${swapSelection && m.SwapSelection} ${swapCursor && m.SwapCursor}`}>
            <td className={m.LinkIndex} onClick={() => swapSelection ? completeSwapCb(link.index) : swapCb(swapCursor ? undefined  : link.id)}>
                <span>{link.index}</span>
            </td>
            <td>
                <a href={link.origin}>{link.origin}</a>
            </td>
            <td>
                <a href={link.fake}>{link.fake}</a>
            </td>
            <td>
                {link.tag}
            </td>
            <td>
                {link.visits}
            </td>
            <td>
                <input className="input_transparent" defaultValue={link.subscribers} type="number" placeholder="Subs" onChange={e => setSubscribers(Number(e.target.value))}/>
            </td>
            <td>
                {link.successfullVisits}
            </td>
            <td>
                <div className={m.TdContent}>
                    <div className="mini-badge badge-green">
                        Active
                    </div>
                </div>
            </td>
            <td>
                <div className={m.TdContent}>
                    <button className="mini-badge badge-red badge-btn" onClick={() => handleDelete()}>
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    )
}

export default observer(AdminLink)