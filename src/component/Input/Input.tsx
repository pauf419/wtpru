"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import m from "./Input.module.sass";

interface InputProps {
    placeholder: string 
    onChange: (v: string) => void
    required?: boolean
    value: string
    primary?: boolean
    invalid?: boolean
    invalidPlaceholder?: string
    maxlength?: number
}

const Input: FC<InputProps> = ({maxlength = 1000, invalid = false, invalidPlaceholder = false, placeholder, onChange, required=false, value, primary = false}) => {
  const [focus, setFocus] = useState<boolean>(false);
  const [v, setV] = useState<string>()
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(!value || value === "") setFocus(false)
    if(value) {
      setV(value)
      setFocus(true)
    }
  }, [value])

  return (
    <div className={`${m.Wrapper} ${invalid && m.Invalid} ${primary && m.Primary} ${(primary && (focus || v)) && m.PrimaryActive}`} ref={wrapperRef}>
      <label 
        className={`${m.Placeholder} ${(focus || v) && m.Active}`} 
        htmlFor="inp" 
        onClick={() => setFocus(true)}
        >
        {invalid ? invalidPlaceholder : placeholder}
      </label>
      <input
        maxLength={maxlength}
        required={required}
        value={value}
        onChange={e => {
          setV(e.target.value)
          onChange(e.target.value)
        }}
        className={m.Input}
        id="inp"
        autoFocus={focus}
        onFocus={() => setFocus(true)}
        onBlur={(e) => !v && setFocus(false)}
        autoComplete="off"
      />
    </div>
  );
};

export default Input;
