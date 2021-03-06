import React, { useState, useEffect, useCallback, useContext, useRef} from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import moment from "moment";
import momentHijri from "moment-hijri";
import "moment-timezone";
import "moment-duration-format";
import "moment/locale/bs";
import Cookies from "universal-cookie";
import slugify from "slugify";
import ReactNotifications from "react-browser-notifications";
import { v4 as uuidv4 } from "uuid";
import Helmet from "react-helmet";
import {
  locations,
  locationsDative,
  vakatNames,
  locationsShort,
  weights
} from "../data/vaktija.json";
import { daily } from "../api/vaktija/index.mjs";
import IconDark from "../icons/IconDark.js";
import IconLight from "../icons/IconLight.js";
import RelativeTime from "./RelativeTime";
import Vakat from "./Vakat";
import Counter from "./Counter";
import CurrentDate from "./CurrentDate";
import Location from "./Location";
import Stores from "./Stores";
import Locations from "./Locations";
import Footer from "./Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../contexts/ThemeContext";
import ReactGA from "react-ga";
import "./Daily.css";
import PrayerData  from "./prayer-data";

const cookies = new Cookies();

const toOrdinalSuffixMinutes = num => {
  const int = parseInt(num, 10),
    digits = [int % 10, int % 100],
    ordinals = [" minutu", " minute", " minute", " minute", " minuta"],
    // ordinals = [" min", " min", " min", " min", " min"],
    oPattern = [1, 2, 3, 4],
    tPattern = [11, 12, 13, 14, 15, 16, 17, 18, 19];
  return oPattern.includes(digits[0]) && !tPattern.includes(digits[1])
    ? ordinals[digits[0] - 1]
    : ordinals[4];
};

const toOrdinalSuffixHours = num => {
  const int = parseInt(num, 10),
    digits = [int % 10, int % 100],
    ordinals = [" heure", " heures", " heures", " heures", " heures"],
    oPattern = [1, 2, 3, 4],
    tPattern = [11, 12, 13, 14, 15, 16, 17, 18, 19];
  return oPattern.includes(digits[0]) && !tPattern.includes(digits[1])
    ? ordinals[digits[0] - 1]
    : ordinals[4];
};

const translate = (number, withoutSuffix, key) => {
  var result = number + " ";
  // eslint-disable-next-line default-case
  switch (key) {
    case "ss":
      if (number === 1) {
        result += "sekunda";
      } else if (number === 2 || number === 3 || number === 4) {
        result += "sekunde";
      } else {
        result += "sekundi";
      }
      return result;
    case "m":
      return withoutSuffix ? "jedna minuta" : "jednu minutu";
    // result += toOrdinalSuffixMinutes(number);
    // return result;
    case "mm":
      result += toOrdinalSuffixMinutes(number);
      return result;
    case "h":
      return withoutSuffix ? "jedan" : "jedan sat";
    // result += toOrdinalSuffixHours(number);
    // return result;
    case "hh":
      result += toOrdinalSuffixHours(number);
      return result;
    case "dd":
      if (number === 1) {
        result += "dan";
      } else {
        result += "dana";
      }
      return result;
    case "MM":
      if (number === 1) {
        result += "mjesec";
      } else if (number === 2 || number === 3 || number === 4) {
        result += "mjeseca";
      } else {
        result += "mjeseci";
      }
      return result;
    case "yy":
      if (number === 1) {
        result += "godina";
      } else if (number === 2 || number === 3 || number === 4) {
        result += "godine";
      } else {
        result += "godina";
      }
      return result;
  }
};

moment.updateLocale("bs", {
  iMonths: [
    "Muharrem",
    "Safar",
    "Rabii al awal",
    "Rabii ath-thani",
    "Džumade-l-ula",
    "Džumade-l-uhra",
    "Redžeb",
    "Ša'ban",
    "Ramadan",
    "Ševval",
    "Zu-l-ka'de",
    "Zu-l-hidždže"
  ],
  weekdaysShort: ["Dim", "Lun", "Mar", "Mer", "Jeudi", "Vendredi", "Samedi"],
  relativeTime: {
    future: "dans %s",
    past: "il y a %s",
    s: "quelques secondes",
    ss: translate,
    m: translate,
    mm: translate,
    h: translate,
    hh: translate,
    d: "un jour",
    dd: translate,
    M: "un mois",
    MM: translate,
    y: "godinu",
    yy: translate
  }
});

ReactGA.initialize(process.env.REACT_APP_GA);

library.add(fab, fas);

function Daily({ locationProps = 72, root }) {

  const context = useContext(ThemeContext);

  const _data = useRef(new PrayerData(locationProps));

 // eslint-disable-next-line
 useEffect(() => {
      _data.current.getPrayerTimesFromGoogleSheets();
      }, [locationProps]);


let newObj = Object.entries(_data.current.getPrayerTimes());

  const localization = useCallback(() => {
    if (root && cookies.get("location") !== undefined) {
      return cookies.get("location");
    }
    return locationProps;
  }, [locationProps, root]);

 const nextVakat = () => {
    const nextVakatPosition = daily(localization()).vakat.map((v, i) => ({
      pos: i,
      active: moment()
        .tz("Europe/Paris")
        .isSameOrBefore(moment(v, "HH:mm").tz("Europe/Paris"))
    }));

    if (nextVakatPosition.filter(n => n.active === true).length) {
      return nextVakatPosition.filter(n => n.active === true)[0].pos;
    } else {
      return 6;
    }
  };

  const [notification, setNotification] = useState();
  const [currentMoment, setCurrentMoment] = useState(
    moment().tz("Europe/Paris")
  );
  const [locationState] = useState(localization());
  const [vaktija, setVaktija] = useState(daily(localization()).vakat);
  const [nextVakatPosition, setNextVakatPosition] = useState(nextVakat());
  const { toggleTheme, initTheme, automaticTheme, theme } = context;
  const [date, setDate] = useState([
    moment().tz("Europe/Paris").format("ddd, D. MMMM"),
    moment().tz("Europe/Paris").format("YYYY"),
    momentHijri().tz("Europe/Paris").format("iD. iMMMM iYYYY").toLowerCase()
  ]);

  const showNotifications = useCallback(() => {
    if (notification.supported()) notification.show();
  }, [notification]);

  const tick = useCallback(() => {
    const clock = moment().tz("Europe/Paris").format();
    const notifs = vaktija.map((v, i) =>
      moment(v, "HH:mm").tz("Europe/Paris").subtract(15, "m").format()
    );
    const nextVakatPosition = daily(localization()).vakat.map((v, i) => ({
      pos: i,
      active: moment()
        .tz("Europe/Paris")
        .isSameOrBefore(moment(v, "HH:mm").tz("Europe/Paris"))
    }));

    setCurrentMoment(moment().tz("Europe/Paris"));
    setVaktija(daily(localization()).vakat);
    setDate([
      moment().tz("Europe/Paris").format("ddd, D. MMMM"),
      moment().tz("Europe/Paris").format("YYYY"),
      momentHijri()
        .tz("Europe/Paris")
        .format("iD. iMMMM iYYYY")
        .toLowerCase()
    ]);

    if (notifs.includes(clock)) {
      showNotifications();
    }

    if (nextVakatPosition.filter(n => n.active === true).length) {
      setNextVakatPosition(
        nextVakatPosition.filter(n => n.active === true)[0].pos
      );
    } else {
      setNextVakatPosition(6);
    }
  }, [localization, showNotifications, vaktija]);

  

  useEffect(() => {
    const interval = setInterval(() => tick(), 1000);
    return () => clearInterval(interval);
  }, [tick]);

  useEffect(() => {
    if (automaticTheme) {
      if (
        moment().isBetween(
          moment(vaktija[1], "HH:mm"),
          moment(vaktija[4], "HH:mm")
        )
      ) {
        initTheme("light");
      } else {
        initTheme("dark");
      }
    }
    // eslint-disable-next-line
  }, [automaticTheme, initTheme, nextVakatPosition]);

  useEffect(() => {
    if (!root) {
      cookies.set("location", locationProps, {
        path: "/",
        domain: ".vaktija.ba",
        expires: moment().add(1, "y").tz("Europe/Paris").toDate()
      });
    }
    ReactGA.set({ title: `${locations[locationState]} · Vaktija` });
    ReactGA.pageview(window.location.pathname + window.location.search);
    // eslint-disable-next-line
  }, [locationProps, root]);

  const handleClick = event => {
    window.focus();
    notification.close(event.target.tag);
  };

  const openNav = () => {
    document.getElementById("sidenav").style.width = "100%";
  };

  const closeNav = e => {
    e.preventDefault();
    document.getElementById("sidenav").style.width = "0";
  };
  
  return (
    <>
      <Helmet>
        <link
          rel="canonical"
          href={`https://heuredepriere.tech/${slugify(locations[locationState], {
            replacement: "-",
            remove: null,
            lower: true
          })}`}
        />
        <meta
          name="description"
          content={`Heure de priere ${locationsDative[locationState]}, ${date[0]} ${
            date[1]
          } / ${date[2]}${vakatNames.map(
            (vakatName, index) => ` ${vakatName} ${vaktija[index]}`
          )}. horaire de priere paris, heure de priere paris`}
        />
        <meta
          name="theme-color"
          content={theme === "light" ? "#ffffff" : "#1e2227"}
        />
        <title>{`${locations[locationState]} · Heure de priere`}</title>
      </Helmet>
      <ReactNotifications
        onRef={ref => setNotification(ref)}
        title={`${vakatNames[nextVakatPosition]} je za 15 minuta`}
        body={`${locations[locationState]}, ${date[0]} ${date[1]} / ${date[2]}`}
        icon={"icon.png"}
        tag={uuidv4()}
        interaction="true"
        onClick={event => handleClick(event)}
      />
      <Container>
        <Row>
          <Col className="text-left" xs={6} sm={6} md={6} lg={6}>
            <Link aria-label="Home" to="/">
              {theme === "light" ? (
                <IconDark
                  height="32"
                  width="32"
                  className="brand"
                  alt="heuredepriere.tech"
                />
              ) : (
                <IconLight
                  height="32"
                  width="32"
                  className="brand"
                  alt="heuredepriere.tech"
                />
              )}
            </Link>
          </Col>
          <Col className="text-right" xs={6} sm={6} md={6} lg={6}>
            <FontAwesomeIcon
              className={theme}
              onClick={openNav}
              icon={["fas", "map-marker-alt"]}
              size="2x"
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={12} md={12} lg={12}>
            <CurrentDate
              theme={theme}
              date={date}
              location={locationState}
              locations={locations}
            />
            <Location
              theme={theme}
              location={locationState}
              locations={locations}
            />
          </Col>
        </Row>
        <Row>
          <Col className="text-center" xs={12} sm={12} md={12} lg={12}>
            <Counter theme={theme} vakatTime={newObj[nextVakatPosition][1]} />
          </Col>
        </Row>
        <Row>
        {vakatNames.map((vakatName, index) => (
            <Col
              key={vaktija[index]}
              className="text-center"
              xs={12}
              sm={12}
              md={12}
              lg={2}
            >
              <Vakat 
                theme={theme}
                vakatTime={newObj[index+1][1]}
                vakatName={vakatName}
                highlight={nextVakatPosition === index ? true : false}
              />
              <RelativeTime
                theme={theme}
                vakatTime={newObj[index+1][1]}
                currentMoment={currentMoment}
              />
            </Col>
          ))}
        </Row>
        <Row>
          <Col className="text-center" xs={12} sm={12} md={12} lg={12}>
            <br />
            <Stores theme={theme} />
          </Col>
        </Row>
      </Container>
      <Locations
        closeNav={closeNav}
        locations={locations}
        locationsShort={locationsShort}
        weights={weights}
      />
      <br />
      <Footer theme={theme} toggleTheme={toggleTheme} />
    </>
  );
}
export default Daily;
