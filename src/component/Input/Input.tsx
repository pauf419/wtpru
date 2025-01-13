"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import m from "./Input.module.sass";

interface InputProps {
    placeholder: string 
    onChange: (v: string) => void
    required?: boolean
    value: string
    primary?: boolean
}

const Input: FC<InputProps> = ({placeholder, onChange, required=false, value, primary = false}) => {
  const [focus, setFocus] = useState<boolean>(false);
  const [v, setV] = useState<string>()
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onChange(v!)
  }, [v])

  useEffect(() => {
    if(!value || value === "") setFocus(false)
    if(value) {
      setV(value)
      setFocus(true)
    }
  }, [value])

  return (
    <div className={`${m.Wrapper} ${primary && m.Primary} ${(primary && (focus || v)) && m.PrimaryActive}`} ref={wrapperRef}>
      <label 
        className={`${m.Placeholder} ${(focus || v) && m.Active}`} 
        htmlFor="inp" 
        onClick={() => setFocus(true)}
        >
        {placeholder}
      </label>
      <input
        required={required}
        value={value}
        onChange={e => setV(e.target.value)}
        className={m.Input}
        id="inp"
        autoFocus={focus}
        onFocus={() => setFocus(true)}
        onBlur={(e) => !v && setFocus(false)}
      />
    </div>
  );
};

export default Input;
