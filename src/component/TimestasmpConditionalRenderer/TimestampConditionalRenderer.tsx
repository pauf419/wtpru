import React, { useState, useEffect, ReactNode, FC } from "react";

interface Props {
  timestamp: string;
  Before: ReactNode; 
  After: ReactNode;  
}

const TimestampConditionalRenderer: FC<Props> = ({ timestamp, Before, After }) => {
  const [is24HoursPassed, setIs24HoursPassed] = useState(false);

  useEffect(() => {
    const checkTime = () => {
      const now = Date.now();
      const targetTime = Number(timestamp) + 24 * 60 * 60 * 1000; 
      setIs24HoursPassed(now >= targetTime);
    };

    checkTime();

    const interval = setInterval(checkTime, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return <>{is24HoursPassed ? After : Before}</>; 
};

export default TimestampConditionalRenderer;