
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


interface AdminLinkProps {
    link: IAdminLink
    deleteCb: (id: string) => void
    index?: number
}

const AdminLink: FC<AdminLinkProps> = ({link, deleteCb, index = 0}) => {

    const handleDelete = async () => {
        deleteCb(link.id)
    }

    return (
        <tr className={m.Tr}>
            <td>
                {index}
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