{
  "type": "FeatureCollection",
  "name": "gasolineras",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:EPSG::3857"
    }
  },
  "features": [
    {
      "type": "Feature",
      "properties": {
        "id": 1,
        "nombre": "Galp",
        "telefono": "965 54 50 24",
        "direccion": "N-340",
        "precio": {
          "gasolina_normal": 1.48,
          "gasolina_super": 1.62,
          "gasoleo": 1.36
        }
      },
      "geometry": {
        "type": "MultiPoint",
        "coordinates": [
          [-52479.55290456797, 4676424.337716415]
        ]
      }
    },
    {
      "type": "Feature",
      "properties": {
        "id": 2,
        "nombre": "Shell",
        "telefono": "689 36 69 03",
        "direccion": "Carrer Alacant, 62",
        "precio": {
          "gasolina_normal": 1.50,
          "gasolina_super": 1.65,
          "gasoleo": 1.38
        }
      },
      "geometry": {
        "type": "MultiPoint",
        "coordinates": [
          [-53391.928600234896, 4677163.39916867]
        ]
      }
    }
  ]
}
