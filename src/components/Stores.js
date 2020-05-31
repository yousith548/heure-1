import React from "react";
import "./Stores.css";

function Stores({ theme }) {
  return (
    <div className="text-center">
      <p className={`p p-${theme}`}>
      Ces horaires mensuels imprimables sont proposés par notre le site <a href="https://heuredepriere.tech">heuredepriere.tech</a> , et sont destinés à celles et ceux qui n'ont pas de mosquée à proximité de chez eux, sans quoi cas il convient qu'ils suivent les horaires de leur mosquée.  Ils sont estimés par des calculs astronomiques et sont conformes aux avis du Conseil Européen de la Fatwa et de la Recherche (CEFR) et de la Ligue Islamique Mondiale.
      </p>
    </div>
  );
}

export default Stores;
