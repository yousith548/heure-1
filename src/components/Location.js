import React from "react";
import "./Location.css";
import { Container, Row, Col } from "react-bootstrap";

function Location({ theme, location, locations }) {
  return (

    <header className="header">
      <Container>
        <Row>
          <Col className="text-center" xs={12} sm={12} md={12} lg={12}>
          <p className={`p p-${theme}`}>Retrouvez sur notre site les horaires des prières (heures de salat) quotidiennes de la ville de :</p>
             <h1 className={`location location-${theme}`}>{locations[location]}</h1>
          </Col>
        </Row>
      </Container>
    </header>
  );
}

export default Location;
