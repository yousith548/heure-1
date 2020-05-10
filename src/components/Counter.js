import React from "react";
import moment from "moment";
import "./Counter.css"; 

function Counter({ vakatTime, theme }) {
  const vakatMoment = moment(vakatTime, "HH:mm").tz("Europe/Paris");
  const duration = moment.duration(
    vakatMoment.diff(moment().tz("Europe/Paris"))
  );

  if (vakatTime === undefined) {
    return null;
  } else {
    return (
      <div className={`counter counter-${theme}`}>
        {duration.format("*HH:mm:ss")}
      </div>
    );
  }
}

export default Counter;
