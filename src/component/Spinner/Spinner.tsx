
import { FC } from "react"
import m from "./Spinner.module.sass"

interface SpinnerProps {
    primary?: boolean
    mini?: boolean
}

const Spinner: FC<SpinnerProps> = ({mini = false, primary = true}) => {
    return (
        <span className={`${mini ? m.LoaderMini : m.LoaderPrimary} ${primary && m.Primary} ${mini && m.Mini}`}></span>
    )
}

export default Spinner