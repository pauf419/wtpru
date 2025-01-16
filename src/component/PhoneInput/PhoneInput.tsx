
import React, { FC, useEffect, useRef, useState } from "react";
import m from "./PhoneInput.module.sass";
import countries from "../../assets/flags/flags"
import Country from "./Country/Country";
import { ICountry } from "../../models/ICountry";
import { parsePhoneNumber } from 'react-phone-number-input'

interface PhoneInputProps {
    selectCb: (c:ICountry) => void
    pattern: string
}

const PhoneInput:FC<PhoneInputProps> = ({selectCb, pattern}) => {
  const [focus, setFocus] = useState<boolean>(false);
  const [selected, setSelected] = useState<ICountry>()
  const wrapperRef = useRef<any>(null);
  const dropdownRef = useRef<any>(null);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      wrapperRef.current &&
      dropdownRef.current &&
      !wrapperRef.current.contains(event.target as Node) &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setFocus(false);
    }
  };

  const handleSelect = (country: ICountry) => {
    setFocus(false)
    setSelected(country)
    selectCb(country)
  }

  useEffect(() => {
    if (focus) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [focus]);

  useEffect(() => {
    if (focus) {
      const computedStyles = window.getComputedStyle(wrapperRef.current);
      const { top, left, width, height } =
        wrapperRef.current.getBoundingClientRect();
      dropdownRef.current.style.scale = "1";
      dropdownRef.current.style.opacity = "1"
      dropdownRef.current.style.pointerEvents = "all"

      dropdownRef.current.style.width = computedStyles.width;
      const y = top + window.scrollY + height;
      const x = left + window.scrollX;
      const calcHeight = window.innerHeight / 3;
      dropdownRef.current.style.height = `${calcHeight}px`;
      if (y + calcHeight > window.innerHeight)
        dropdownRef.current.style.top = `${top - calcHeight - 5}px`;
      else dropdownRef.current.style.top = `${y + 5}px`;
      dropdownRef.current.style.left = `${x}px`;
      dropdownRef.current.style.width = `${width}px`;
    } else {
      dropdownRef.current.style.scale = "0.95";
      dropdownRef.current.style.opacity = "0"
      dropdownRef.current.style.pointerEvents = "none"
    }
  }, [focus]);

  useEffect(() => {
    if(!pattern || pattern.trim() === "" || pattern.trim() === "+") return setSelected(undefined);
    const parsed = parsePhoneNumber(pattern)
    if(parsed) for(var i=0;i < countries.length;i++) {
        if(countries[i].countryLit === parsed.country) {
            return setSelected(countries[i])
        }
    }
    for(var i=0;i < countries.length;i++) {
        if(countries[i].phone === pattern || countries[i].phone.includes(pattern)) {
            return setSelected(countries[i])
        }
    }
  }, [pattern])

  return (
    <div className={`${m.Wrapper} ${(focus || selected) && m.Active}`}ref={wrapperRef}>
      <label className={`${m.Placeholder} ${(focus || selected) && m.Active}`} htmlFor="inp" onClick={() => setFocus(true)}>
        Country
      </label>
      <input
        className={m.Input}
        id="inp"
        autoFocus={focus}
        onFocus={() => setFocus(true)}
        onBlur={(e) => e.preventDefault()}
        autoComplete="off"
        value={selected?.country}
      />
      <div className={`${m.DropdownWrapper} ${focus && m.Active}`} ref={dropdownRef}>
        {countries.map(el => <Country country={el as ICountry} key={el.phone} selectCb={handleSelect}/>)}
      </div>
    </div>
  );
};

export default PhoneInput;
