import { FC } from "react";
import { ICountry } from "../../../models/ICountry";
import m from "./Country.module.sass"

interface CountryProps {
    country: ICountry
    selectCb: (c:ICountry) => void
}

const Country: FC<CountryProps> = ({country, selectCb}) => {
    return (
        <div className={m.CountryWrapper} onClick={() => selectCb(country)}>
            <div className={m.Segment}>
                <img src={"/flag/" + country.flag}/>
                {country.country}
            </div>
            <div className={m.Code}>{country.phone}</div>
        </div>
    )
}

export default Country