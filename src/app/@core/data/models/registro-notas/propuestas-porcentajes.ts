export const PropuestasPorcentajes = {
    Corte1: {
        name: "Corte 1",
        field: [
            {
                name: "P1",
                needPercent: true,
                perc: 10
            },
            {
                name: "P2",
                needPercent: true,
                perc: 10
            },
            {
                name: "P3",
                needPercent: true,
                perc: 15
            }
        ],
        porcentaje: 35
    },
    Corte2: {
        name: "Corte 2",
        field: [
            {
                name: "P4",
                needPercent: true,
                perc: 5
            },
            {
                name: "P5",
                needPercent: true,
                perc: 5
            },
            {
                name: "P6",
                needPercent: true,
                perc: 5
            },
            {
                max: 20,
                name: "LAB",
                needPercent: true,
                perc: 20
            }
        ],
        porcentaje: 35
    },
    Examen: {
        name: "Exámen",
        field: [
            {
                fix: 30,
                name: "EXA",
                needPercent: true,
                perc: 30
            }
        ],
        porcentaje: 30
    },
    Habilit: {
        name: "Habilitación",
        field: [
            {
                fix: 70,
                name: "HAB",
                needPercent: true,
                perc: 70
            }
        ],
        porcentaje: 70
    },
    Definitiva: {
        name: "Definitiva",
        field: [
            {
                fix: 100,
                name: "DEF",
                needPercent: true,
                perc: 100
            }
        ],
        porcentaje: 100
    }
}