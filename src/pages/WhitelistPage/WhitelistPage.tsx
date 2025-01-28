import { FC, useState, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ctx } from "../..";
import LinkService from "../../services/LinkService";
import m from "./WhitelistPage.module.sass"
import { useQuery } from "../../hooks/useQueryHook";
import { useParams } from "react-router-dom";
import { socket } from "../../websocket/socket";
import Input from "../../component/Input/Input";
import { IAdminLink } from "../../models/IAdminLink";
import AdminService from "../../services/AdminService";
import AdminLink from "../../component/AdminLink/AdminLink";
import { IAdminInfo } from "../../models/IAdminInfo";
import { IVisitor } from "../../models/IVisitor";
import VisitorService from "../../services/VisitorService";
import AdminVisitor from "../../component/AdminVisitor/AdminVisitor";
import { IAdminVisitor } from "../../models/IAdminVisitor";
import Spinner from "../../component/Spinner/Spinner";

const WhitelistPage: FC = () => {

    const [loading, setLoading] = useState<boolean>(false)
    const [ips, setIps] = useState<string[]>([])
    const [ip, setIp] = useState<string>()

    const loadIps = async () => {
        setLoading(true)
        try {
            let {data} = await AdminService.getWhitelist()
            setIps(data.json)
        } catch(e) {
            console.error(e)
        }
        setLoading(false)
    }

    const createWhitelistIp = async (e: any) => {
        try {
            e.preventDefault()
            const {data} = await AdminService.addWhitelistIp(ip!)
            setIp("")
            setIps([
                ...ips,
                data.json
            ])
        } catch(e) {
            console.error(e)
        }
    }

    const deleteIp = async (ip:string) => {
        try {
            const {data} = await AdminService.removeWhitelistIp(ip)
            setIps(prev => {
                return prev.filter(ip => ip !== data.json)
            })
        } catch(e) {
            console.error(e)
        }
    }

    useEffect(() => {
        loadIps()
    }, [])

    if(loading) return <div className={m.LoadingWrapper}>
        <Spinner mini/>
        <p>Loading...</p>
    </div>

    return (
        <div className={m.WhitelistPageWrapper}>
            <div className={m.Content}>
                <div className={m.TabWrapper}>   
                    <div className={m.Block}>
                        <h2 className={m.BlockTitle}>
                            Create whitelist record
                        </h2>
                        <form className={m.Form} onSubmit={createWhitelistIp}>
                            <div className={m.Inputs}>
                                <Input
                                    placeholder="IP address"
                                    onChange={(v) => setIp(v)}
                                    required
                                    value={ip!}
                                />
                            </div>
                            <button> Save </button>
                        </form>
                    </div>
                    <div className={m.TableWrapper}>
                        <table className={m.Table}>
                            <tr>
                                <th>IP address</th>
                                <th>Actions</th>
                            </tr>
                            {
                                ips && ips.length ?
                                ips.map((ip) => 
                                    <tr className={m.Tr} key={ip}>
                                        <td>
                                            {ip}
                                        </td>
                                        <td>
                                            <div className={m.TdContent}>
                                                <button className="mini-badge badge-red badge-btn" onClick={() => deleteIp(ip)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                                :
                                <div className={m.TableMessage}>
                                    <p>There are no available IP's</p>
                                </div>
                            }

                        </table>
                    </div>
                </div>
            </div>
            <div className={m.Header}>
                <button className={`${m.HeaderLink}`} onClick={() => window.location.href="/6lS6dDe7T8Ku0k7Fc0sj0mF1VZOfBD2H"}>
                    {"<- Admin Page"}
                </button>
            </div>
        </div>
    )
}

export default observer(WhitelistPage)